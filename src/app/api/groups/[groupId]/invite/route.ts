import { auth, type User } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { getUserByClerkId, getUserByEmail } from "@/server/queries";
import { groupInvites, groups } from "@/server/db/schema";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { createGroupInvite } from "../../../../../server/groups/mutations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
    with: {
      groupMembers: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const isActiveUserAdmin = group.groupMembers.some(
    (member) => member.user.id === user.id && member.role === "admin",
  );

  if (!isActiveUserAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, userToInviteId, createBlankInvite } =
    (await request.json()) as {
      email?: string;
      userToInviteId?: string;
      createBlankInvite?: boolean;
    };

  // Handle blank invite creation
  if (createBlankInvite) {
    const inviteCreated = await createGroupInvite(groupId);
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/groups/${groupId}/join?invite=${inviteCreated.verificationCode}`;

    return NextResponse.json(
      {
        message: "Blank invite created successfully",
        invite: inviteCreated,
        inviteLink,
      },
      { status: 200 },
    );
  }

  // Handle email or user ID invites
  if (!email && !userToInviteId) {
    return NextResponse.json(
      {
        error: "Email, userToInviteId, or createBlankInvite is required",
      },
      { status: 400 },
    );
  }

  let userToInvite: Awaited<ReturnType<typeof getUserByEmail>> | null = null;

  if (email) {
    userToInvite = await getUserByEmail(email);
    if (!userToInvite) {
      return NextResponse.json(
        {
          error:
            "User with this email not found. You can create a blank invite instead.",
        },
        { status: 404 },
      );
    }
  } else if (userToInviteId) {
    userToInvite = await getUserByClerkId(userToInviteId);
    if (!userToInvite) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already a member
    const isUserAlreadyMember = group.groupMembers.some(
      (member) => member.user.id === userToInvite?.id,
    );

    if (isUserAlreadyMember) {
      return NextResponse.json(
        { error: "User is already a member of the group" },
        { status: 400 },
      );
    }

    // Check if user is already invited
    const isUserAlreadyInvited = await db.query.groupInvites.findFirst({
      where: and(
        eq(groupInvites.groupId, groupId),
        eq(groupInvites.userId, userToInvite.id),
        eq(groupInvites.status, "pending"),
      ),
    });

    if (isUserAlreadyInvited) {
      return NextResponse.json(
        { error: "User is already invited to the group" },
        { status: 400 },
      );
    }
  }

  const inviteCreated = await createGroupInvite(groupId, userToInvite?.id);
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/groups/${groupId}/join?invite=${inviteCreated.verificationCode}`;

  if (email) {
    //TODO: Send email to user to invite them to the group
    // send email to user to invite them to the group
  }

  return NextResponse.json(
    {
      message: "Invite sent successfully",
      invite: inviteCreated,
      inviteLink,
    },
    { status: 200 },
  );
}
