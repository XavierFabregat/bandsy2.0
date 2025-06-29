import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { recordUserInteraction } from "@/server/matching-queries";

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
      action: "like" | "pass" | "super_like" | "block";
      context: "search" | "discovery";
    };
    const { targetUserId, action, context } = body;

    if (!targetUserId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["like", "pass", "super_like", "block"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Record the interaction
    await recordUserInteraction(userId, targetUserId, action, context);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording interaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
