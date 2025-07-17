import { type NextRequest, NextResponse } from "next/server";
import { likeComment, unlikeComment } from "@/server/post/mutations";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const commentId = params.commentId;
    const like = await likeComment(userId, commentId);
    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    console.error("Error liking comment:", error);
    return NextResponse.json(
      { error: "Failed to like comment" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const commentId = params.commentId;
    await unlikeComment(userId, commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking comment:", error);
    return NextResponse.json(
      { error: "Failed to unlike comment" },
      { status: 500 },
    );
  }
}
