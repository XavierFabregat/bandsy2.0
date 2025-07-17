import { type NextRequest, NextResponse } from "next/server";
import { addComment } from "@/server/post/mutations";
import { getCommentsByPost } from "@/server/post/queries";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1),
  parentCommentId: z.string().optional(),
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
      content: string;
      parentCommentId?: string;
    };
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const comment = await addComment({ postId, userId, ...parsed.data });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } },
) {
  try {
    const postId = params.postId;
    const comments = await getCommentsByPost(postId);
    // Optionally, build a nested/threaded structure here if needed
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}
