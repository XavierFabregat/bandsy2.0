import { type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/server/queries";
import { NotificationSSEService } from "@/lib/notifications/sse-service";
import { db } from "@/server/db";
import { matches } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: { matchId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const { isTyping } = (await request.json()) as { isTyping: boolean };

    // Get match to find the other participant
    const match = await db
      .select()
      .from(matches)
      .where(eq(matches.id, params.matchId))
      .limit(1);

    if (!match.length) {
      return new Response("Match not found", { status: 404 });
    }

    // Verify user is part of this match
    const currentMatch = match[0];
    if (
      currentMatch?.user1Id !== user.id &&
      currentMatch?.user2Id !== user.id
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    // Find the other participant
    const otherParticipantId =
      currentMatch?.user1Id === user.id
        ? currentMatch?.user2Id
        : currentMatch?.user1Id;

    // Send typing indicator to the other participant
    const success = NotificationSSEService.sendTypingIndicator(
      otherParticipantId,
      {
        userId: user.id,
        userName: user.displayName ?? user.username ?? "Unknown",
        userImage: user.profileImageUrl ?? "",
        isTyping,
        conversationId: params.matchId,
      },
    );

    return Response.json({
      success,
      sent: success ? "typing indicator sent" : "recipient not connected",
    });
  } catch (error) {
    console.error("Error sending typing indicator:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
