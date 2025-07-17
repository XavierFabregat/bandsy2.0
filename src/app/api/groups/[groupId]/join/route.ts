import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/server/queries";
import { db } from "@/server/db";
import { groupInvites, groupMembers } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { claimInvite } from "@/server/groups/mutations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;
    const { action, inviteCode } = (await request.json()) as {
      action: "accept" | "decline";
      inviteCode?: string;
    };

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invitation code is required" },
        { status: 400 },
      );
    }

    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the invite
    const invite = await db.query.groupInvites.findFirst({
      where: and(
        eq(groupInvites.verificationCode, inviteCode),
        eq(groupInvites.status, "pending"),
      ),
    });

    console.log("invite", invite);

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation code" },
        { status: 404 },
      );
    }

    // Check if invite is for this group
    if (invite.groupId !== groupId) {
      return NextResponse.json(
        { error: "Invalid invitation for this group" },
        { status: 400 },
      );
    }

    // Check if invite is expired
    if (new Date() > new Date(invite.verificationCodeExpiresAt)) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 },
      );
    }

    if (action === "accept") {
      // For blank invites, claim them first
      if (!invite.userId) {
        try {
          await claimInvite(inviteCode, userId);
        } catch (error) {
          console.error("Error claiming invite:", error);
          return NextResponse.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to claim invitation",
            },
            { status: 400 },
          );
        }
      } else if (invite.userId !== user.id) {
        return NextResponse.json(
          { error: "This invitation is not for you" },
          { status: 403 },
        );
      }

      // Check if user is already a member
      const existingMember = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, user.id),
        ),
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "You are already a member of this group" },
          { status: 400 },
        );
      }

      // Add user to group
      await db.insert(groupMembers).values({
        groupId,
        userId: user.id,
        role: "member",
        joinedAt: new Date(),
      });

      // Update invite status
      await db
        .update(groupInvites)
        .set({ status: "accepted", updatedAt: new Date() })
        .where(eq(groupInvites.id, invite.id));

      return NextResponse.json({
        success: true,
        message: "Successfully joined the group",
      });
    } else if (action === "decline") {
      // For blank invites, claim them first before declining
      if (!invite.userId) {
        try {
          await claimInvite(inviteCode, userId);
        } catch (error) {
          return NextResponse.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to claim invitation",
            },
            { status: 400 },
          );
        }
      } else if (invite.userId !== user.id) {
        return NextResponse.json(
          { error: "This invitation is not for you" },
          { status: 403 },
        );
      }

      // Update invite status
      await db
        .update(groupInvites)
        .set({ status: "declined", updatedAt: new Date() })
        .where(eq(groupInvites.id, invite.id));

      return NextResponse.json({
        success: true,
        message: "Invitation declined",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "Error processing group invitation:",
        error.message,
        error.stack,
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unknown error processing group invitation:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }
}
