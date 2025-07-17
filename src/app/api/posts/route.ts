import { type NextRequest, NextResponse } from "next/server";
import { createPost, type PostType } from "@/server/post/mutations";
import { getPostsByAuthor, getPostsPaginated } from "@/server/post/queries";
import type { PostAuthorType, PostVisibility } from "@/server/post/queries";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { isAdmin } from "@/lib/utils/isAdmin";

const postSchema = z.object({
  content: z.string().optional(),
  type: z
    .enum(["text", "image", "video", "audio", "link", "media_sample", "mixed"])
    .optional(),
  authorType: z.enum(["user", "group"]),
  authorId: z.string(),
  mediaSampleId: z.string().optional(),
  visibility: z
    .enum(["public", "followers_only", "group_members_only", "private"])
    .optional(),
  status: z.enum(["published", "draft", "archived", "deleted"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as {
      content?: string;
      type?: PostType;
      authorType: PostAuthorType;
      authorId: string;
      mediaSampleId?: string;
    };
    // Validate input (add Zod validation here if available)
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const data = parsed.data;
    // Only allow creating as self or as group admin (add group admin check if needed)
    if (data.authorType === "user" && data.authorId !== userId) {
      return NextResponse.json(
        { error: "Cannot create post for another user" },
        { status: 403 },
      );
    }
    if (data.authorType === "group") {
      const isGroupAdmin = await isAdmin(data.authorId);
      if (!isGroupAdmin) {
        return NextResponse.json(
          {
            error:
              "Only group admins can create group posts, ask for permission to post.",
          },
          { status: 403 },
        );
      }
    }
    const post = await createPost(data);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const authorType = searchParams.get("authorType") as PostAuthorType | null;
    const authorId = searchParams.get("authorId");
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const visibility =
      (searchParams.get("visibility") as PostVisibility) || "public";

    let posts;
    if (authorType && authorId) {
      posts = await getPostsByAuthor({
        authorType,
        authorId,
        limit,
        offset,
        visibility,
      });
    } else {
      posts = await getPostsPaginated({ limit, offset, visibility });
    }
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
