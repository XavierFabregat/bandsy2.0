import { auth } from "@clerk/nextjs/server";
import { db } from "../db";
import {
  conversations,
  conversationParticipants,
  messages,
  users,
} from "../db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Get match conversation with messages
 */
export async function getMatchConversation(
  clerkId: string,
  matchId: string,
): Promise<{
  conversation: {
    id: string;
    matchId: string;
    participants: {
      id: string;
      clerkId: string;
      displayName: string;
      profileImageUrl: string | null;
    }[];
  };
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    content: string | null;
    type: string;
    createdAt: Date;
    isRead: boolean | null;
  }[];
} | null> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  const currentUserId = user[0]!.id;

  // Get conversation
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.matchId, matchId))
    .limit(1);

  if (!conversation) return null;

  // Verify user is participant
  const [participation] = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversation.id),
        eq(conversationParticipants.userId, currentUserId),
      ),
    )
    .limit(1);

  if (!participation) return null;

  // Get participants
  const participants = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      clerkId: users.clerkId,
      profileImageUrl: users.profileImageUrl,
    })
    .from(conversationParticipants)
    .innerJoin(users, eq(conversationParticipants.userId, users.id))
    .where(eq(conversationParticipants.conversationId, conversation.id));

  // Get messages
  const conversationMessages = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      senderName: users.displayName,
      senderImage: users.profileImageUrl,
      content: messages.content,
      type: messages.type,
      createdAt: messages.createdAt,
      isRead: messages.isRead,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, conversation.id))
    .orderBy(messages.createdAt);

  return {
    conversation: {
      id: conversation.id,
      matchId: conversation.matchId!,
      participants,
    },
    messages: conversationMessages,
  };
}
