import { type NextRequest, NextResponse } from "next/server";
import { sharePost } from "@/server/post/mutations";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const shareSchema = z.object({
  comment: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const postId = params.postId;
    const body = (await request.json()) as {
      comment?: string;
    };
    const parsed = shareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const share = await sharePost(userId, postId, parsed.data.comment);
    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error("Error sharing post:", error);
    return NextResponse.json(
      { error: "Failed to share post" },
      { status: 500 },
    );
  }
}
