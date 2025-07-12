import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMyGroups } from "@/server/groups/queries";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groups = await getMyGroups();
  return NextResponse.json(groups);
}
