import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  acceptCollaborationInvite,
  declineCollaborationInvite,
} from "@/server/matching/mutations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inviteId } = await params;

    // Parse request body
    const body = (await request.json()) as {
      action: "accept" | "decline";
    };
    const { action } = body;

    if (!action || !["accept", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "accept") {
      // Accept the collaboration invite
      const result = await acceptCollaborationInvite(userId, inviteId);

      return NextResponse.json({
        success: true,
        matchCreated: result.matchCreated,
        matchId: result.matchId,
        message: "Collaboration invite accepted successfully",
      });
    } else if (action === "decline") {
      // Decline the collaboration invite
      const result = await declineCollaborationInvite(userId, inviteId);

      return NextResponse.json({
        success: result.success,
        message: "Collaboration invite declined",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
