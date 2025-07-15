import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { getUserByClerkId, getUserByEmail } from "@/server/queries";
import { groupInvites, groups } from "@/server/db/schema";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";

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

  const { email } = (await request.json()) as { email: string };

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const userToInvite = await getUserByEmail(email);

  if (!userToInvite) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isUserAlreadyMember = group.groupMembers.some(
    (member) => member.user.id === userToInvite.id,
  );

  if (isUserAlreadyMember) {
    return NextResponse.json(
      { error: "User is already a member of the group" },
      { status: 400 },
    );
  }

  const isUserAlreadyInvited = await db.query.groupInvites.findFirst({
    where: and(
      eq(groupInvites.groupId, groupId),
      eq(groupInvites.userId, userToInvite.id),
    ),
  });

  if (isUserAlreadyInvited) {
    return NextResponse.json(
      { error: "User is already invited to the group" },
      { status: 400 },
    );
  }

  await db.insert(groupInvites).values({
    groupId,
    userId: userToInvite.id,
    inviterId: user.id,
  });

  //TODO: Send email to user to invite them to the group

  return NextResponse.json(
    { message: "Invite sent successfully" },
    { status: 200 },
  );
}
