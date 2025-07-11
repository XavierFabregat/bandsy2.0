import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPendingInvites } from "@/server/matching/queries";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pending invites
    const invites = await getPendingInvites(userId);

    return NextResponse.json({
      success: true,
      invites,
    });
  } catch (error) {
    console.error("Error getting pending invites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
