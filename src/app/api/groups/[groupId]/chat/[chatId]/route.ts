import { type NextRequest, NextResponse } from "next/server";
import { getGroupChat } from "@/server/conversations/queries";
import { auth } from "@clerk/nextjs/server";
import { sendGroupChatMessage } from "@/server/conversations/mutations";
import { NotificationSSEService } from "@/lib/notifications/sse-service";
import { getGroupById } from "@/server/groups/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; chatId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, chatId } = await params;

    const conversation = await getGroupChat(userId, groupId, chatId);

    const group = await getGroupById(groupId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ conversation, group });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; chatId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = (await request.json()) as { content: string };

  const { groupId, chatId } = await params;

  const conversation = await getGroupChat(userId, groupId, chatId);

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const createdMessage = await sendGroupChatMessage(
    userId,
    conversation.id,
    content,
  );

  // send message to other users via SSE
  const otherParticipantsIds = conversation.participants
    // filter out the current user
    .filter((participant) => participant.user.clerkId !== userId)
    // map to the clerkId of the other participants
    .map((participant) => participant.user.id);

  NotificationSSEService.sendGroupChatMessage(
    otherParticipantsIds,
    createdMessage,
  );

  return NextResponse.json({ message: createdMessage });
}
