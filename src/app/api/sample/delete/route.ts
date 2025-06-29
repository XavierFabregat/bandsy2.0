import { deleteSample } from "@/server/mutations";
import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { getUserByClerkId } from "@/server/queries";

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sampleId = searchParams.get("sampleId");
  if (!sampleId) {
    return NextResponse.json(
      { error: "Sample ID is required" },
      { status: 400 },
    );
  }

  // this expects the internal user id, not the clerk id
  const user = await getUserByClerkId(userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result = await deleteSample(user.id, sampleId);
  return NextResponse.json(result);
}
