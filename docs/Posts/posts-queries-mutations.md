# Post Queries & Mutations API (Backend)

This section documents the main backend functions for creating, updating, deleting, and fetching posts, as implemented in `src/server/post/queries.ts` and `src/server/post/mutations.ts`.

---

## Mutations

### `createPost`

**Signature:**

```ts
createPost({
  content?: string;
  type?: PostType; // "text" | "image" | "video" | "audio" | "link" | "media_sample" | "mixed"
  authorType: PostAuthorType; // "user" | "group"
  authorId: string;
  mediaSampleId?: string;
  visibility?: PostVisibility; // "public" | "followers_only" | "group_members_only" | "private"
  status?: PostStatus; // "published" | "draft" | "archived" | "deleted"
}): Promise<Post>
```

**Description:**
Creates a new post with the given content, type, author, and optional media sample. Returns the created post.

---

### `updatePost`

**Signature:**

```ts
updatePost(postId: string, data: Partial<{
  content: string;
  type: PostType;
  mediaSampleId: string;
  visibility: PostVisibility;
  status: PostStatus;
}>): Promise<Post>
```

**Description:**
Updates the specified fields of a post by its ID. Returns the updated post.

---

### `softDeletePost`

**Signature:**

```ts
softDeletePost(postId: string): Promise<Post>
```

**Description:**
Soft deletes a post by setting its status to 'deleted' and updating the `deletedAt` timestamp. Returns the updated post.

---

## Queries

### `getPostById`

**Signature:**

```ts
getPostById(postId: string): Promise<Post | undefined>
```

**Description:**
Fetches a single post by its ID.

---

### `getPostsByAuthor`

**Signature:**

```ts
getPostsByAuthor({
  authorType: PostAuthorType;
  authorId: string;
  limit?: number;
  offset?: number;
  visibility?: PostVisibility;
}): Promise<Post[]>
```

**Description:**
Fetches posts for a given author (user or group), with optional pagination and visibility filtering. Returns an array of posts.

---

### `getPostsPaginated`

**Signature:**

```ts
getPostsPaginated({
  limit?: number;
  offset?: number;
  visibility?: PostVisibility;
}): Promise<Post[]>
```

**Description:**
Fetches posts with pagination and optional visibility filtering. Returns an array of posts.

---

**Note:**

- All functions use enum types for `type`, `visibility`, `status`, and `authorType` as defined in the schema.
- These functions are intended for use in API routes and backend logic.

---
