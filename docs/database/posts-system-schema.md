# Posts System Database Schema

## Overview

The posts system enables users and groups to create, share, and interact with various types of content including text, images, videos, audio samples, and links. The system supports a full social media feature set including likes, comments, shares, bookmarks, and mentions.

## Database Design Principles

- **Polymorphic Relationships**: Posts can be authored by either users or groups using `authorType` and `authorId` fields
- **Soft Deletes**: All content uses soft deletion with `deletedAt` timestamps
- **Denormalized Counts**: Engagement metrics (likes, comments, shares) are stored for performance
- **Extensible Media**: Support for multiple attachment types with detailed metadata
- **Nested Comments**: Full reply thread support with parent-child relationships
- **Comprehensive Indexing**: Optimized for common query patterns

## Core Tables

### Posts Table (`bandsy_post`)

The main posts table supporting both user and group authorship.

```sql
CREATE TABLE bandsy_post (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polymorphic author relationship
  author_type post_author_type NOT NULL, -- 'user' | 'group'
  author_id UUID NOT NULL,               -- references users.id or groups.id
  
  -- Content
  content TEXT,                          -- main text content
  type post_type NOT NULL DEFAULT 'text', -- 'text' | 'image' | 'video' | 'audio' | 'link' | 'media_sample' | 'mixed'
  
  -- Media integration
  media_sample_id UUID REFERENCES bandsy_media_sample(id) ON DELETE SET NULL,
  
  -- Settings
  visibility post_visibility NOT NULL DEFAULT 'public', -- 'public' | 'followers_only' | 'group_members_only' | 'private'
  status post_status NOT NULL DEFAULT 'published',      -- 'published' | 'draft' | 'archived' | 'deleted'
  character_limit INTEGER DEFAULT 500,                  -- 500 for regular, 2000 for premium
  
  -- Engagement metrics (denormalized for performance)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ -- soft delete
);
```

**Indexes:**
- `posts_author_idx` - (author_type, author_id) for finding user/group posts
- `posts_created_at_idx` - created_at for chronological feeds
- `posts_status_idx` - status for filtering published posts
- `posts_visibility_idx` - visibility for access control
- `posts_type_idx` - type for content type filtering
- `posts_deleted_at_idx` - deleted_at for soft delete queries

### Post Attachments Table (`bandsy_post_attachment`)

Handles media files attached to posts (images, videos, documents).

```sql
CREATE TABLE bandsy_post_attachment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES bandsy_post(id) ON DELETE CASCADE,
  
  -- File information
  url VARCHAR(500) NOT NULL,           -- file URL/path
  filename VARCHAR(255),               -- original filename
  mime_type VARCHAR(100),              -- MIME type
  file_size INTEGER,                   -- size in bytes
  
  -- Media metadata
  type VARCHAR(50) NOT NULL,           -- 'image' | 'video' | 'audio' | 'document'
  width INTEGER,                       -- for images/videos
  height INTEGER,                      -- for images/videos
  duration INTEGER,                    -- for videos/audio (seconds)
  
  -- Accessibility and captions
  alt TEXT,                           -- alt text for images
  caption TEXT,                       -- user-provided caption
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Interaction Tables

### Post Likes Table (`bandsy_post_like`)

```sql
CREATE TABLE bandsy_post_like (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES bandsy_post(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES bandsy_user(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(post_id, user_id) -- prevent duplicate likes
);
```

### Comments Table (`bandsy_comment`)

Supports nested comment threads with parent-child relationships.

```sql
CREATE TABLE bandsy_comment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES bandsy_post(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES bandsy_user(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  
  -- Nested comments
  parent_comment_id UUID REFERENCES bandsy_comment(id) ON DELETE CASCADE,
  
  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ -- soft delete
);
```

### Comment Likes Table (`bandsy_comment_like`)

```sql
CREATE TABLE bandsy_comment_like (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES bandsy_comment(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES bandsy_user(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(comment_id, user_id) -- prevent duplicate likes
);
```

### Post Shares Table (`bandsy_post_share`)

```sql
CREATE TABLE bandsy_post_share (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_post_id UUID NOT NULL REFERENCES bandsy_post(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES bandsy_user(id) ON DELETE CASCADE,
  comment TEXT,                        -- optional comment when sharing
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Post Bookmarks Table (`bandsy_post_bookmark`)

```sql
CREATE TABLE bandsy_post_bookmark (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES bandsy_post(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES bandsy_user(id) ON DELETE CASCADE,
  collection_name VARCHAR(100),        -- future: bookmark collections
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(post_id, user_id) -- prevent duplicate bookmarks
);
```

## Advanced Features

### Mentions Table (`bandsy_mention`)

Handles @mentions of users and groups in posts and comments.

```sql
CREATE TABLE bandsy_mention (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Where the mention appears (polymorphic)
  mentionable_type VARCHAR(20) NOT NULL,    -- 'post' | 'comment'
  mentionable_id UUID NOT NULL,             -- references post.id or comment.id
  
  -- Who is mentioned (polymorphic)
  mentioned_type VARCHAR(20) NOT NULL,      -- 'user' | 'group'
  mentioned_id UUID NOT NULL,               -- references user.id or group.id
  
  -- Who created the mention
  mentioner_user_id UUID NOT NULL REFERENCES bandsy_user(id) ON DELETE CASCADE,
  
  -- Text position for highlighting
  start_position INTEGER,
  end_position INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Enums

### Post-Related Enums

```sql
-- Post content types
CREATE TYPE post_type AS ENUM (
  'text',         -- text-only posts
  'image',        -- image posts
  'video',        -- video posts
  'audio',        -- audio posts
  'link',         -- link posts
  'media_sample', -- posts with audio samples
  'mixed'         -- posts with multiple content types
);

-- Author types (polymorphic relationship)
CREATE TYPE post_author_type AS ENUM (
  'user',         -- posted by individual user
  'group'         -- posted by group
);

-- Visibility levels
CREATE TYPE post_visibility AS ENUM (
  'public',             -- visible to everyone
  'followers_only',     -- visible to followers only (future)
  'group_members_only', -- visible to group members only (future)
  'private'             -- private posts (future)
);

-- Post status
CREATE TYPE post_status AS ENUM (
  'published',    -- publicly visible
  'draft',        -- saved but not published (future)
  'archived',     -- archived by author
  'deleted'       -- soft deleted
);
```

### Enhanced Notification Types

```sql
-- Extended notification types for posts
CREATE TYPE notification_type AS ENUM (
  -- ... existing types ...
  'post_liked',      -- someone liked your post
  'post_commented',  -- someone commented on your post
  'post_shared',     -- someone shared your post
  'comment_liked',   -- someone liked your comment
  'comment_replied', -- someone replied to your comment
  'user_mentioned'   -- someone mentioned you
);
```

## Query Patterns

### Common Queries

#### Get User Posts
```sql
SELECT * FROM bandsy_post 
WHERE author_type = 'user' 
  AND author_id = $userId 
  AND status = 'published' 
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20 OFFSET $offset;
```

#### Get Group Posts
```sql
SELECT * FROM bandsy_post 
WHERE author_type = 'group' 
  AND author_id = $groupId 
  AND status = 'published' 
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20 OFFSET $offset;
```

#### Get Post with Full Details
```sql
SELECT 
  p.*,
  -- Author info (requires UNION for polymorphic relationship)
  -- Post attachments
  pa.url as attachment_url,
  pa.type as attachment_type,
  -- Media sample info
  ms.title as sample_title,
  ms.audio_url as sample_url
FROM bandsy_post p
LEFT JOIN bandsy_post_attachment pa ON p.id = pa.post_id
LEFT JOIN bandsy_media_sample ms ON p.media_sample_id = ms.id
WHERE p.id = $postId;
```

#### Get Comments Thread
```sql
WITH RECURSIVE comment_tree AS (
  -- Root comments
  SELECT id, content, user_id, parent_comment_id, 0 as depth
  FROM bandsy_comment 
  WHERE post_id = $postId AND parent_comment_id IS NULL AND deleted_at IS NULL
  
  UNION ALL
  
  -- Nested replies
  SELECT c.id, c.content, c.user_id, c.parent_comment_id, ct.depth + 1
  FROM bandsy_comment c
  JOIN comment_tree ct ON c.parent_comment_id = ct.id
  WHERE c.deleted_at IS NULL
)
SELECT * FROM comment_tree ORDER BY depth, created_at;
```

## Performance Considerations

### Denormalization Strategy

**Engagement Counts**: Likes, comments, and shares counts are stored directly on posts for fast display. These are updated via database triggers or application-level increment/decrement operations.

**Benefits:**
- Fast feed rendering without COUNT() queries
- Reduced database load for popular posts
- Better caching efficiency

**Trade-offs:**
- Slight complexity in maintaining count accuracy
- Potential for count drift (mitigated by periodic reconciliation)

### Indexing Strategy

**Feed Queries**: Combined indexes on (author_type, author_id, created_at) for efficient user/group feed queries.

**Engagement Queries**: Separate indexes on foreign keys (post_id, user_id) for interaction tables.

**Search Optimization**: Full-text search indexes on content fields for content discovery.

## Character Limits

### Regular Users
- **Posts**: 500 characters
- **Comments**: 200 characters

### Premium Users  
- **Posts**: 2000 characters
- **Comments**: 500 characters

Character limits are enforced at both the application and database levels using the `character_limit` field on posts.

## File Upload Limits

### Supported Formats
- **Images**: JPG, PNG, GIF, WebP (max 10MB each)
- **Videos**: MP4, WebM (max 100MB each)
- **Audio**: MP3, WAV, OGG (integrated with existing media samples)

### Storage Strategy
- Files stored in cloud storage (AWS S3/CloudFlare R2)
- Database stores URLs and metadata only
- Progressive image loading and video streaming support

## Security Considerations

### Input Validation
- Content sanitization to prevent XSS
- File type validation and virus scanning
- Rate limiting for post creation and interactions

### Access Control
- Polymorphic author validation (users can only post as themselves or groups they admin)
- Visibility rules enforcement
- Mention permission validation

### Privacy
- Soft deletes preserve data integrity while respecting user deletion requests
- Personal data anonymization support for GDPR compliance

## Migration Strategy

The posts system tables will be added incrementally:

1. **Phase 1**: Core posts and interactions tables
2. **Phase 2**: Advanced features (mentions, bookmarks)
3. **Phase 3**: Enhanced media support and analytics

Each phase includes appropriate data migration scripts and backward compatibility considerations.