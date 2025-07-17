import { type NextRequest, NextResponse } from "next/server";
import { deleteComment } from "@/server/post/mutations";
import { getCommentById } from "@/server/post/queries";
import { auth } from "@clerk/nextjs/server";

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
    const comment = await getCommentById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: "Cannot delete another user's comment" },
        { status: 403 },
      );
    }
    await deleteComment(commentId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
