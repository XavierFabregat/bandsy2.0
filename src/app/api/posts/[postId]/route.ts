import { type NextRequest, NextResponse } from "next/server";
import {
  updatePost,
  softDeletePost,
  type PostType,
  type PostStatus,
  type PostVisibility,
} from "@/server/post/mutations";
import { getPostById } from "@/server/post/queries";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { isAdmin } from "@/lib/utils/isAdmin";

const updateSchema = z.object({
  content: z.string().optional(),
  type: z
    .enum(["text", "image", "video", "audio", "link", "media_sample", "mixed"])
    .optional(),
  mediaSampleId: z.string().optional(),
  visibility: z
    .enum(["public", "followers_only", "group_members_only", "private"])
    .optional(),
  status: z.enum(["published", "draft", "archived", "deleted"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const postId = params.postId;
    const post = await getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    // Only allow editing own post or as group admin
    if (post.authorType === "user" && post.authorId !== userId) {
      return NextResponse.json(
        { error: "Cannot edit another user's post" },
        { status: 403 },
      );
    }
    if (post.authorType === "group") {
      const isGroupAdmin = await isAdmin(post.authorId);
      if (!isGroupAdmin) {
        return NextResponse.json(
          { error: "Only group admins can edit group posts" },
          { status: 403 },
        );
      }
    }
    const body = (await request.json()) as {
      content?: string;
      type?: PostType;
      mediaSampleId?: string;
      visibility?: PostVisibility;
      status?: PostStatus;
    };
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const updated = await updatePost(postId, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
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
    const post = await getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    // Only allow deleting own post or as group admin
    if (post.authorType === "user" && post.authorId !== userId) {
      return NextResponse.json(
        { error: "Cannot delete another user's post" },
        { status: 403 },
      );
    }
    if (post.authorType === "group") {
      const isGroupAdmin = await isAdmin(post.authorId);
      if (!isGroupAdmin) {
        return NextResponse.json(
          { error: "Only group admins can delete group posts" },
          { status: 403 },
        );
      }
    }
    const deleted = await softDeletePost(postId);
    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
