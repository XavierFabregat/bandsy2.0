import { auth } from "@clerk/nextjs/server";
import { db } from "../db";
import { groupInvites, groupMembers } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { getUserByClerkId } from "../queries";

export async function createGroupInvite(groupId: string, userId?: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  // Get the internal database user ID for the inviter
  const inviter = await getUserByClerkId(clerkId);
  if (!inviter) {
    throw new Error("Inviter not found");
  }

  const verificationCode = Math.random().toString(36).substring(2, 15);
  const verificationCodeExpiresAt = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7,
  );

  const [invite] = await db
    .insert(groupInvites)
    .values({
      groupId,
      userId: userId ?? null, // Allow null for blank invites
      inviterId: inviter.id, // Use the internal database user ID, not the Clerk ID
      verificationCode,
      verificationCodeExpiresAt,
    })
    .returning();

  if (!invite) {
    throw new Error("Failed to create invite");
  }

  return invite;
}

export async function claimInvite(verificationCode: string, clerkId: string) {
  const invite = await db.query.groupInvites.findFirst({
    where: eq(groupInvites.verificationCode, verificationCode),
  });

  const user = await getUserByClerkId(clerkId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!invite) {
    throw new Error("Invalid invitation code");
  }

  if (invite.status !== "pending") {
    throw new Error("Invitation has already been used");
  }

  if (new Date() > new Date(invite.verificationCodeExpiresAt)) {
    throw new Error("Invitation has expired");
  }

  // Cannot be claimed by someone who is already a member of the group
  const isMember = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, invite.groupId),
      eq(groupMembers.userId, user.id),
    ),
  });

  if (isMember) {
    throw new Error("You are already a member of this group");
  }

  // If the invite was created for a specific user, verify it matches
  if (invite.userId && invite.userId !== user.id) {
    throw new Error("This invitation is not for you");
  }

  // Update the invite to assign it to the current user
  const [updatedInvite] = await db
    .update(groupInvites)
    .set({
      userId: user.id, // Use the internal database user ID, not the Clerk ID
      updatedAt: new Date(),
    })
    .where(eq(groupInvites.id, invite.id))
    .returning();

  return updatedInvite;
}
