import { type NextRequest, NextResponse } from "next/server";
import { handleMatchOutcome } from "@/server/conversations/mutations";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { matchId } = await params;
    const body = (await request.json()) as {
      outcome: "unmatch" | "create_group" | "join_group";
      data?: {
        groupName?: string;
        existingGroupId?: string;
        inviteeUserId?: string;
      };
    };
    const { outcome, data } = body;

    if (
      !outcome ||
      !["unmatch", "create_group", "join_group"].includes(outcome)
    ) {
      return NextResponse.json({ error: "Invalid outcome" }, { status: 400 });
    }

    const result = await handleMatchOutcome(userId, matchId, outcome, data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error handling match outcome:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
