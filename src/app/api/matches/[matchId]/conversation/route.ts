import { type NextRequest, NextResponse } from "next/server";
import { getMatchConversation } from "@/server/conversations/queries";
import { auth } from "@clerk/nextjs/server";
import { sendMatchMessage } from "@/server/conversations/mutations";
import { NotificationSSEService } from "@/lib/notifications/sse-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await getMatchConversation(userId, params.matchId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(conversation);
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
  { params }: { params: { matchId: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = (await request.json()) as { content: string };

  const result = await getMatchConversation(userId, params.matchId);

  if (!result?.conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const { conversation } = result;

  const createdMessage = await sendMatchMessage(
    userId,
    conversation.id,
    content,
  );

  // send message to other user via SSE
  const otherParticipant = conversation.participants.find(
    (participant) => participant.clerkId !== userId,
  );
  if (!otherParticipant) {
    return NextResponse.json(
      { error: "Other participant not found" },
      { status: 404 },
    );
  }
  NotificationSSEService.sendMatchMessage(otherParticipant.id, createdMessage);

  return NextResponse.json({ message: createdMessage });
}
