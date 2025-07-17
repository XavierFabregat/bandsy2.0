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
import type { Message } from "../../types/api";
import { getUserByClerkId } from "../queries";

export type Transaction = Parameters<
  Parameters<(typeof db)["transaction"]>[0]
>[0];

/**
 * Send message in match conversation
 */
export async function sendMatchMessage(
  clerkId: string,
  conversationId: string,
  content: string | null,
  type: "text" | "audio" | "image" = "text",
): Promise<Message & { matchId?: string; conversationId: string }> {
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
    .returning();

  if (!message) throw new Error("Failed to send message");

  const [sender] = await db
    .select()
    .from(users)
    .where(eq(users.id, message.senderId))
    .limit(1);
  if (!sender) throw new Error("Sender not found");

  // Update conversation updated timestamp
  const [conversation] = await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId))
    .returning();

  if (!conversation) throw new Error("Failed to update conversation");

  return {
    id: message.id,
    senderId: message.senderId,
    fileUrl: message.fileUrl ?? "",
    type: message.type,
    createdAt: message.createdAt,
    isRead: !!message.isRead,
    senderName: sender.displayName,
    senderImage: sender.profileImageUrl ?? "",
    senderClerkId: sender.clerkId,
    matchId: conversation.matchId ?? "",
    content: message.content ?? "",
    conversationId: conversationId,
  };
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
    handle?: string;
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
      // set the match status to group_created
      // start transaction
      return await db.transaction(async (tx) => {
        await tx
          .update(matches)
          .set({ status: "group_created", updatedAt: new Date() })
          .where(eq(matches.id, matchId));

        // set the conversation status to inactive
        await tx
          .update(conversations)
          .set({ status: "inactive", updatedAt: new Date() })
          .where(eq(conversations.matchId, matchId));

        return await createGroup(
          tx,
          data?.groupName ?? "",
          otherUserId,
          data?.handle,
        );
      });
    case "join_group":
      // set the match status to group_joined
      return await db.transaction(async (tx) => {
        await tx
          .update(matches)
          .set({ status: "group_joined", updatedAt: new Date() })
          .where(eq(matches.id, matchId));

        // set the conversation status to inactive
        await tx
          .update(conversations)
          .set({ status: "inactive", updatedAt: new Date() })
          .where(eq(conversations.matchId, matchId));

        return await inviteToGroup(
          tx,
          data?.existingGroupId ?? "",
          data?.inviteeUserId ?? "",
        );
      });

    default:
      throw new Error("Invalid outcome");
  }
}

export async function createGroup(
  tx: Transaction,
  groupName: string,
  otherUserId: string,
  handle?: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  //get user internal id
  const user = await getUserByClerkId(userId);
  if (!user) throw new Error("User not found");

  if (!groupName) throw new Error("Group name required");

  // Create new group
  const [group] = await tx
    .insert(groups)
    .values({
      name: groupName,
      handle: handle ?? groupName.toLowerCase().replace(/\s+/g, "_"),
      description: `Collaboration group created from match`,
      isActive: true,
      maxMembers: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: groups.id });

  if (!group) throw new Error("Failed to create group");

  // Add both users to group
  await tx.insert(groupMembers).values([
    {
      groupId: group.id,
      userId: user.id,
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
  const [groupConversation] = await tx
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
    await tx.insert(conversationParticipants).values([
      {
        conversationId: groupConversation.id,
        userId: user.id,
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
}

export async function inviteToGroup(
  tx: Transaction,
  groupId: string,
  inviteeUserId: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  //get user internal id
  const user = await getUserByClerkId(userId);
  if (!user) throw new Error("User not found");

  // Check if user is admin of group
  const [groupMember] = await tx
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id),
        eq(groupMembers.role, "admin"),
      ),
    )
    .limit(1);

  if (!groupMember) throw new Error("Not authorized to invite to group");

  // Add invitee to group
  await tx.insert(groupMembers).values({
    groupId,
    userId: inviteeUserId,
    role: "member",
    joinedAt: new Date(),
  });

  // Add to group conversation if exists
  const [existingGroupConversation] = await tx
    .select()
    .from(conversations)
    .where(eq(conversations.groupId, groupId))
    .limit(1);

  if (existingGroupConversation) {
    await tx.insert(conversationParticipants).values({
      conversationId: existingGroupConversation.id,
      userId: inviteeUserId,
      joinedAt: new Date(),
    });
  }

  return { success: true, groupId };
}

export async function sendGroupChatMessage(
  clerkId: string,
  conversatinId: string,
  content: string,
  type: "text" | "audio" | "image" = "text",
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  const currentUserId = user.id;

  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversatinId),
    with: {
      participants: true,
    },
  });

  if (!conversation) throw new Error("Conversation not found");

  if (!conversation.participants.some((p) => p.userId === currentUserId)) {
    console.log(
      "⚠️ If you are here check if the p.userId is the clerkId or the internal one.",
    );
    throw new Error("User is not a participant of the conversation");
  }

  const [message] = await db
    .insert(messages)
    .values({
      conversationId: conversation.id,
      senderId: currentUserId,
      type,
      content,
      isRead: false,
      createdAt: new Date(),
    })
    .returning({
      id: messages.id,
    });

  if (!message) throw new Error("Failed to send message");

  const createdMessage = await db.query.messages.findFirst({
    where: eq(messages.id, message.id),
    with: {
      sender: true,
    },
  });

  if (!createdMessage) throw new Error("Failed to send message");

  return {
    id: createdMessage.id,
    senderId: createdMessage.sender.id,
    fileUrl: createdMessage.fileUrl ?? "",
    type: createdMessage.type,
    createdAt: createdMessage.createdAt,
    isRead: !!createdMessage.isRead,
    senderName: createdMessage.sender.displayName,
    senderImage: createdMessage.sender.profileImageUrl ?? "",
    senderClerkId: createdMessage.sender.clerkId,
    groupId: conversation.groupId ?? "",
    content: createdMessage.content ?? "",
    conversationId: conversation.id,
  };
}
