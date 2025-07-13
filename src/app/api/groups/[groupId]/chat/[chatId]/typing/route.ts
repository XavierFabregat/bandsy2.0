import { type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/server/queries";
import { NotificationSSEService } from "@/lib/notifications/sse-service";
import { getGroupById } from "@/server/groups/queries";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; chatId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { groupId, chatId } = await params;

    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const { isTyping } = (await request.json()) as { isTyping: boolean };

    // Get group to find the other participants
    const group = await getGroupById(groupId);
    if (!group) {
      return new Response("Group not found", { status: 404 });
    }

    // Verify user is part of this group
    const isParticipant = group.groupMembers.some(
      (member) => member.user.id === user.id,
    );
    if (!isParticipant) {
      // do nothing, not even return forbidden
      return;
    }

    const otherParticipantsIds = group.groupMembers
      .filter((member) => member.user.id !== user.id)
      .map((member) => member.user.id);

    // Send typing indicator to the other participant
    const success = NotificationSSEService.sendTypingIndicators(
      otherParticipantsIds,
      {
        userId: user.id,
        userName: user.displayName ?? user.username ?? "Unknown",
        userImage: user.profileImageUrl ?? "",
        isTyping,
        conversationId: chatId,
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
