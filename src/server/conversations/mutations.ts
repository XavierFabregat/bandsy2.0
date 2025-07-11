import { db } from "@/server/db";
import {
  users,
  conversations,
  conversationParticipants,
  messages,
  matches,
  groups,
  groupMembers,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

/**
 * Send message in match conversation
 */
export async function sendMatchMessage(
  clerkId: string,
  conversationId: string,
  content: string,
  type: "text" | "audio" | "image" = "text",
): Promise<{ messageId: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  const currentUserId = user[0]!.id;

  // Verify user is participant
  const [participation] = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, currentUserId),
      ),
    )
    .limit(1);

  if (!participation) throw new Error("Not authorized to send message");

  // Insert message
  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: currentUserId,
      type,
      content,
      isRead: false,
      createdAt: new Date(),
    })
    .returning({ id: messages.id });

  if (!message) throw new Error("Failed to send message");

  // Update conversation updated timestamp
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return { messageId: message.id };
}

/**
 * Handle match outcomes
 */
export async function handleMatchOutcome(
  clerkId: string,
  matchId: string,
  outcome: "unmatch" | "create_group" | "join_group",
  data?: {
    groupName?: string;
    existingGroupId?: string;
    inviteeUserId?: string; // For join_group scenario
  },
): Promise<{ success: boolean; groupId?: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  const currentUserId = user[0]!.id;

  // Get match
  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1);

  if (!match) throw new Error("Match not found");

  // Verify user is part of the match
  if (match.user1Id !== currentUserId && match.user2Id !== currentUserId) {
    throw new Error("Not authorized");
  }

  const otherUserId =
    match.user1Id === currentUserId ? match.user2Id : match.user1Id;

  switch (outcome) {
    case "unmatch":
      // Set match status to unmatched
      await db
        .update(matches)
        .set({ status: "unmatched", updatedAt: new Date() })
        .where(eq(matches.id, matchId));

      return { success: true };

    case "create_group":
      if (!data?.groupName) throw new Error("Group name required");

      // Create new group
      const [group] = await db
        .insert(groups)
        .values({
          name: data.groupName,
          description: `Collaboration group created from match`,
          isActive: true,
          maxMembers: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: groups.id });

      if (!group) throw new Error("Failed to create group");

      // Add both users to group
      await db.insert(groupMembers).values([
        {
          groupId: group.id,
          userId: currentUserId,
          role: "admin",
          joinedAt: new Date(),
        },
        {
          groupId: group.id,
          userId: otherUserId,
          role: "member",
          joinedAt: new Date(),
        },
      ]);

      // Create group conversation
      const [groupConversation] = await db
        .insert(conversations)
        .values({
          groupId: group.id,
          isGroupChat: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: conversations.id });

      if (groupConversation) {
        // Add participants to group conversation
        await db.insert(conversationParticipants).values([
          {
            conversationId: groupConversation.id,
            userId: currentUserId,
            joinedAt: new Date(),
          },
          {
            conversationId: groupConversation.id,
            userId: otherUserId,
            joinedAt: new Date(),
          },
        ]);
      }

      return { success: true, groupId: group.id };

    case "join_group":
      if (!data?.existingGroupId || !data?.inviteeUserId) {
        throw new Error("Group ID and invitee user ID required");
      }

      // Add invitee to existing group
      await db.insert(groupMembers).values({
        groupId: data.existingGroupId,
        userId: data.inviteeUserId,
        role: "member",
        joinedAt: new Date(),
      });

      // Add to group conversation if exists
      const [existingGroupConversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.groupId, data.existingGroupId))
        .limit(1);

      if (existingGroupConversation) {
        await db.insert(conversationParticipants).values({
          conversationId: existingGroupConversation.id,
          userId: data.inviteeUserId,
          joinedAt: new Date(),
        });
      }

      return { success: true, groupId: data.existingGroupId };

    default:
      throw new Error("Invalid outcome");
  }
}
