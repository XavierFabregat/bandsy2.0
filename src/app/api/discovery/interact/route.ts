import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sendCollaborationInvite } from "@/server/matching/mutations";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = (await request.json()) as {
      targetUserId: string;
      action: "invite" | "pass" | "block";
      context: "search" | "discovery";
      message?: string;
    };
    const { targetUserId, action, context, message } = body;

    if (!targetUserId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["invite", "pass", "block"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "invite") {
      // Send collaboration invite
      const result = await sendCollaborationInvite(
        userId,
        targetUserId,
        message,
        context,
      );

      return NextResponse.json({
        success: true,
        inviteId: result.inviteId,
        message: "Collaboration invite sent successfully",
      });
    } else if (action === "pass") {
      // Just record the pass - no notification needed
      // We can still track this for analytics
      return NextResponse.json({
        success: true,
        message: "Passed",
      });
    } else if (action === "block") {
      // Handle blocking logic here if needed
      return NextResponse.json({
        success: true,
        message: "User blocked",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording interaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
