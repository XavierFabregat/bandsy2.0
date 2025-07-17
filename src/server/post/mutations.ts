import { db } from "@/server/db";
import {
  posts,
  type postAuthorTypeEnum,
  type postStatusEnum,
  type postTypeEnum,
  type postVisibilityEnum,
  postLikes,
  postShares,
  postBookmarks,
  comments,
  commentLikes,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

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

export async function likePost(userId: string, postId: string) {
  const [like] = await db
    .insert(postLikes)
    .values({ userId, postId })
    .onConflictDoNothing()
    .returning();
  return like;
}

export async function unlikePost(userId: string, postId: string) {
  await db
    .delete(postLikes)
    .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));
}

export async function sharePost(
  userId: string,
  postId: string,
  comment?: string,
) {
  const [share] = await db
    .insert(postShares)
    .values({ userId, originalPostId: postId, comment })
    .returning();
  return share;
}

export async function bookmarkPost(
  userId: string,
  postId: string,
  collectionName?: string,
) {
  const [bookmark] = await db
    .insert(postBookmarks)
    .values({ userId, postId, collectionName })
    .onConflictDoNothing()
    .returning();
  return bookmark;
}

export async function unbookmarkPost(userId: string, postId: string) {
  await db
    .delete(postBookmarks)
    .where(
      and(eq(postBookmarks.userId, userId), eq(postBookmarks.postId, postId)),
    );
}

export async function addComment({
  postId,
  userId,
  content,
  parentCommentId,
}: {
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
}) {
  const [comment] = await db
    .insert(comments)
    .values({ postId, userId, content, parentCommentId })
    .returning();
  return comment;
}

export async function deleteComment(commentId: string, userId: string) {
  // Only allow deleting own comment (enforced in API)
  await db
    .delete(comments)
    .where(and(eq(comments.id, commentId), eq(comments.userId, userId)));
}

export async function likeComment(userId: string, commentId: string) {
  const [like] = await db
    .insert(commentLikes)
    .values({ userId, commentId })
    .onConflictDoNothing()
    .returning();
  return like;
}

export async function unlikeComment(userId: string, commentId: string) {
  await db
    .delete(commentLikes)
    .where(
      and(
        eq(commentLikes.userId, userId),
        eq(commentLikes.commentId, commentId),
      ),
    );
}
