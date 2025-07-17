# Posts API Endpoints

This document describes the API endpoints for creating, fetching, updating, and deleting posts.

---

## Create Post

**POST** `/api/posts`

- **Description:** Create a new post (user or group).
- **Request Body:**
  - `content` (string, optional): The post content.
  - `type` (enum, optional): "text" | "image" | "video" | "audio" | "link" | "media_sample" | "mixed"
  - `authorType` (enum, required): "user" | "group"
  - `authorId` (string, required): User or group ID.
  - `mediaSampleId` (string, optional): Linked media sample.
  - `visibility` (enum, optional): "public" | "followers_only" | "group_members_only" | "private"
  - `status` (enum, optional): "published" | "draft" | "archived" | "deleted"
- **Validation:** All input is validated with Zod.
- **Permissions:**
  - Users can only create posts for themselves (authorType: "user", authorId: their own ID).
  - Group posts require group admin (logic enforced in PATCH/DELETE, can be extended here).
- **Response:**
  - `201 Created` with the created post object.
  - `400 Bad Request` for validation errors.
  - `401 Unauthorized` if not authenticated.
  - `403 Forbidden` if not allowed.
  - `500 Internal Server Error` for server errors.

---

## Get Posts

**GET** `/api/posts`

- **Description:** Fetch posts, optionally filtered by author and visibility, with pagination.
- **Query Params:**
  - `authorType` ("user" | "group", optional): Filter by author type.
  - `authorId` (string, optional): Filter by author ID.
  - `limit` (number, optional): Number of posts to return (default: 20).
  - `offset` (number, optional): Offset for pagination (default: 0).
  - `visibility` (enum, optional): "public" | "followers_only" | "group_members_only" | "private" (default: "public")
- **Response:**
  - `200 OK` with an array of post objects.
  - `500 Internal Server Error` for server errors.

---

## Update Post

**PATCH** `/api/posts/[postId]`

- **Description:** Update a post's content, type, media, visibility, or status.
- **Request Body:**
  - Any subset of: `content`, `type`, `mediaSampleId`, `visibility`, `status` (same types as above).
- **Validation:** All input is validated with Zod.
- **Permissions:**
  - Users can only update their own posts.
  - Group posts can only be updated by group admins (checked via `isAdmin` util).
- **Response:**
  - `200 OK` with the updated post object.
  - `400 Bad Request` for validation errors.
  - `401 Unauthorized` if not authenticated.
  - `403 Forbidden` if not allowed.
  - `404 Not Found` if post does not exist.
  - `500 Internal Server Error` for server errors.

---

## Delete Post (Soft Delete)

**DELETE** `/api/posts/[postId]`

- **Description:** Soft delete a post (sets status to 'deleted' and updates `deletedAt`).
- **Permissions:**
  - Users can only delete their own posts.
  - Group posts can only be deleted by group admins (checked via `isAdmin` util).
- **Response:**
  - `200 OK` with the deleted post object.
  - `401 Unauthorized` if not authenticated.
  - `403 Forbidden` if not allowed.
  - `404 Not Found` if post does not exist.
  - `500 Internal Server Error` for server errors.

---

**Notes:**

- All endpoints require authentication.
- Zod is used for input validation.
- Group admin logic is enforced for group posts.
- All errors return a JSON object with an `error` field.
