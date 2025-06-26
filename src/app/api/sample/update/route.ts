import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { getUserByClerkId } from "@/server/queries";
import { updateSample } from "@/server/mutations";
import { type UpdateSampleMetadata } from "@/server/mutations";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUserByClerkId(userId);

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const { sampleId, metadata } = (await req.json()) as {
    sampleId: string;
    metadata: UpdateSampleMetadata;
  };

  const res = await updateSample(user.id, sampleId, metadata);

  return NextResponse.json(res);
}
