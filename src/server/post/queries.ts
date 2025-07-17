import { db } from "@/server/db";
import { posts } from "@/server/db/schema";
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
