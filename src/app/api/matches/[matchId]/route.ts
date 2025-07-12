import { type NextRequest, NextResponse } from "next/server";
import { getMatch } from "@/server/matching/queries";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { matchId } = await params;
  const match = await getMatch(matchId);
  return NextResponse.json(match);
}
