import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { groupMembers, groups } from "@/server/db/schema";
import { getUserByClerkId } from "@/server/queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string; groupId: string }> },
) {
  const { memberId, groupId } = await params;
  const { userId } = await auth();
  const { role } = (await request.json()) as { role: "admin" | "member" };

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

  const member = group.groupMembers.find(
    (member) => member.user.id === memberId,
  );

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const isActiveUserAdmin = group.groupMembers.some(
    (member) => member.user.id === user.id && member.role === "admin",
  );

  if (!isActiveUserAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // check that member and active user are not the same
  if (member.user.id === user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 400 },
    );
  }

  // the active user is admin, the member exists, and the member is not the active user
  // update the member's role
  await db
    .update(groupMembers)
    .set({ role: role })
    .where(
      and(eq(groupMembers.userId, memberId), eq(groupMembers.groupId, groupId)),
    );

  return NextResponse.json(
    { message: "Member role updated successfully" },
    { status: 200 },
  );
}
