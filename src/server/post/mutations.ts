import { db } from "@/server/db";
import {
  posts,
  type postAuthorTypeEnum,
  type postStatusEnum,
  type postTypeEnum,
  type postVisibilityEnum,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Define enum types locally to match schema
export type PostType = (typeof postTypeEnum.enumValues)[number];
export type PostVisibility = (typeof postVisibilityEnum.enumValues)[number];
export type PostStatus = (typeof postStatusEnum.enumValues)[number];
export type PostAuthorType = (typeof postAuthorTypeEnum.enumValues)[number];

export async function createPost({
  content,
  type = "text",
  authorType,
  authorId,
  mediaSampleId,
  visibility = "public",
  status = "published",
}: {
  content?: string;
  type?: PostType;
  authorType: PostAuthorType;
  authorId: string;
  mediaSampleId?: string;
  visibility?: PostVisibility;
  status?: PostStatus;
}) {
  const [post] = await db
    .insert(posts)
    .values({
      content,
      type,
      authorType,
      authorId,
      mediaSampleId,
      visibility,
      status,
    })
    .returning();
  return post;
}

export async function updatePost(
  postId: string,
  data: Partial<{
    content: string;
    type: PostType;
    mediaSampleId: string;
    visibility: PostVisibility;
    status: PostStatus;
  }>,
) {
  const [post] = await db
    .update(posts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(posts.id, postId))
    .returning();
  return post;
}

export async function softDeletePost(postId: string) {
  const [post] = await db
    .update(posts)
    .set({ status: "deleted", deletedAt: new Date() })
    .where(eq(posts.id, postId))
    .returning();
  return post;
}
