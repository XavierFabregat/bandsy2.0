import { type NextRequest, NextResponse } from "next/server";
import { likePost, unlikePost } from "@/server/post/mutations";
import { auth } from "@clerk/nextjs/server";

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
    const like = await likePost(userId, postId);
    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
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
    await unlikePost(userId, postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking post:", error);
    return NextResponse.json(
      { error: "Failed to unlike post" },
      { status: 500 },
    );
  }
}
