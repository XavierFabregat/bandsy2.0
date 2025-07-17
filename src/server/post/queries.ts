import { db } from "@/server/db";
import {
  posts,
  postLikes,
  postShares,
  postBookmarks,
  comments,
  commentLikes,
} from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type {
  postVisibilityEnum,
  postStatusEnum,
  postAuthorTypeEnum,
} from "@/server/db/schema";

// Define enum types locally to match schema
export type PostVisibility = (typeof postVisibilityEnum.enumValues)[number];
export type PostStatus = (typeof postStatusEnum.enumValues)[number];
export type PostAuthorType = (typeof postAuthorTypeEnum.enumValues)[number];

export async function getPostById(postId: string) {
  return db.query.posts.findFirst({ where: eq(posts.id, postId) });
}

export async function getPostsByAuthor({
  authorType,
  authorId,
  limit = 20,
  offset = 0,
  visibility = "public",
}: {
  authorType: PostAuthorType;
  authorId: string;
  limit?: number;
  offset?: number;
  visibility?: PostVisibility;
}) {
  return db.query.posts.findMany({
    where: and(
      eq(posts.authorType, authorType),
      eq(posts.authorId, authorId),
      eq(posts.visibility, visibility),
      eq(posts.status, "published"),
    ),
    orderBy: desc(posts.createdAt),
    limit,
    offset,
  });
}

export async function getPostsPaginated({
  limit = 20,
  offset = 0,
  visibility = "public",
}: {
  limit?: number;
  offset?: number;
  visibility?: PostVisibility;
}) {
  return db.query.posts.findMany({
    where: and(eq(posts.visibility, visibility), eq(posts.status, "published")),
    orderBy: desc(posts.createdAt),
    limit,
    offset,
  });
}

export async function getPostLikes(postId: string) {
  return db.query.postLikes.findMany({ where: eq(postLikes.postId, postId) });
}

export async function getPostShares(postId: string) {
  return db.query.postShares.findMany({
    where: eq(postShares.originalPostId, postId),
  });
}

export async function getPostBookmarks(userId: string) {
  return db.query.postBookmarks.findMany({
    where: eq(postBookmarks.userId, userId),
  });
}

export async function isPostLikedByUser(userId: string, postId: string) {
  const like = await db.query.postLikes.findFirst({
    where: and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)),
  });
  return !!like;
}

export async function isPostBookmarkedByUser(userId: string, postId: string) {
  const bookmark = await db.query.postBookmarks.findFirst({
    where: and(
      eq(postBookmarks.userId, userId),
      eq(postBookmarks.postId, postId),
    ),
  });
  return !!bookmark;
}

export async function getCommentsByPost(postId: string) {
  return db.query.comments.findMany({ where: eq(comments.postId, postId) });
}

export async function getCommentById(commentId: string) {
  return db.query.comments.findFirst({ where: eq(comments.id, commentId) });
}

export async function getCommentLikes(commentId: string) {
  return db.query.commentLikes.findMany({
    where: eq(commentLikes.commentId, commentId),
  });
}

export async function isCommentLikedByUser(userId: string, commentId: string) {
  const like = await db.query.commentLikes.findFirst({
    where: and(
      eq(commentLikes.userId, userId),
      eq(commentLikes.commentId, commentId),
    ),
  });
  return !!like;
}
