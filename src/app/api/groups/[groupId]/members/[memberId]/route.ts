import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { getUserByClerkId } from "@/server/queries";
import { db } from "@/server/db";
import { groupMembers, groups } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { createNotification } from "@/server/notifications/mutations";
import { NotificationSSEService } from "@/lib/notifications/sse-service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string; groupId: string }> },
) {
  const { memberId, groupId } = await params;
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

  // check user who is making the request is in the group and is an admin
  const userGroup = group.groupMembers.find(
    (member) => member.userId === user.id,
  );
  if (!userGroup || userGroup.role !== "admin") {
    return NextResponse.json(
      { error: "You are not authorized to remove this member" },
      { status: 403 },
    );
  }

  // check if the member to remove is in the group
  const member = group.groupMembers.find(
    (member) => member.userId === memberId,
  );

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Get the member's user info for notifications
  const removedMemberUser = member.user;

  // remove the member from the group
  await db
    .delete(groupMembers)
    .where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, memberId)),
    );

  // Send notification to the removed member
  try {
    await createNotification({
      userId: memberId,
      type: "group_member_removed",
      data: {
        groupId: group.id,
        groupName: group.name,
        removedByUserId: user.id,
        removedByUserName: user.displayName || user.username,
        removedByUserDisplayName: user.username,
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Send immediate SSE message for navigation
    NotificationSSEService.sendGroupAccessRevoked(
      removedMemberUser.id,
      group.id,
      group.name,
    );

    console.log(
      `Sent group removal notification to user ${removedMemberUser.id}`,
    );
  } catch (error) {
    console.error("Failed to send removal notification:", error);
    // Don't fail the API call if notification fails
  }

  return NextResponse.json({ message: "Member removed successfully" });
}
