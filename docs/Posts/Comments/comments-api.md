# Comments API Documentation

This document describes the API endpoints for managing comments on posts, including creating, fetching, deleting, and liking/unliking comments.

## Endpoints

### 1. Add/Fetch Comments on a Post

**Endpoint:** `/api/posts/[postId]/comments`

- **POST**: Add a comment to a post
- **GET**: Fetch comments for a post (if implemented)

#### POST Request

- **Body:**
  - `content` (string, required): The comment text
  - `parentCommentId` (string, optional): For nested comments (threaded)
- **Auth:** Required (user must be authenticated)
- **Permissions:** User must have access to the post/group

#### POST Response

- `201 Created` with the created comment object
- `400 Bad Request` for validation errors
- `401 Unauthorized` if not authenticated
- `403 Forbidden` if no permission

---

### 2. Delete a Comment

**Endpoint:** `/api/comments/[commentId]`

- **DELETE**: Delete a comment (soft delete)

#### DELETE Request

- **Auth:** Required (user must be authenticated)
- **Permissions:**
  - User must be the comment author **or**
  - Group admin/moderator (if applicable)

#### DELETE Response

- `200 OK` with confirmation
- `401 Unauthorized` if not authenticated
- `403 Forbidden` if no permission
- `404 Not Found` if comment does not exist

---

### 3. Like/Unlike a Comment

**Endpoint:** `/api/comments/[commentId]/like`

- **POST**: Like a comment
- **DELETE**: Unlike a comment

#### POST/DELETE Request

- **Auth:** Required (user must be authenticated)
- **Permissions:** User must have access to the comment/post

#### POST/DELETE Response

- `200 OK` with updated like status/count
- `401 Unauthorized` if not authenticated
- `403 Forbidden` if no permission
- `404 Not Found` if comment does not exist

---

## General Notes

- All endpoints use Zod for request validation.
- All endpoints require authentication.
- Permission checks are enforced for all actions.
- Nested comments are supported via `parentCommentId`.

## Example Request/Response

### Add Comment (POST)

```json
POST /api/posts/123/comments
{
  "content": "This is a comment!",
  "parentCommentId": "456" // optional
}
```

**Response:**

```json
{
  "id": "789",
  "content": "This is a comment!",
  "authorId": "user_abc",
  "postId": "123",
  "parentCommentId": "456",
  "createdAt": "2024-06-01T12:00:00Z"
}
```

### Like Comment (POST)

```json
POST /api/comments/789/like
```

**Response:**

```json
{
  "success": true,
  "likes": 5
}
```

### Unlike Comment (DELETE)

```json
DELETE /api/comments/789/like
```

**Response:**

```json
{
  "success": true,
  "likes": 4
}
```

### Delete Comment (DELETE)

```json
DELETE /api/comments/789
```

**Response:**

```json
{
  "success": true
}
```
