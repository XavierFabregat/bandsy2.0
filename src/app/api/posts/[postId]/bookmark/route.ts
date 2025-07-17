import { type NextRequest, NextResponse } from "next/server";
import { bookmarkPost, unbookmarkPost } from "@/server/post/mutations";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const bookmarkSchema = z.object({
  collectionName: z.string().optional(),
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
      collectionName?: string;
    };
    const parsed = bookmarkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const bookmark = await bookmarkPost(
      userId,
      postId,
      parsed.data.collectionName,
    );
    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error("Error bookmarking post:", error);
    return NextResponse.json(
      { error: "Failed to bookmark post" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const postId = params.postId;
    await unbookmarkPost(userId, postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unbookmarking post:", error);
    return NextResponse.json(
      { error: "Failed to unbookmark post" },
      { status: 500 },
    );
  }
}
