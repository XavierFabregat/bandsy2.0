# Posts UI Component API Reference

## PostComposer

### Props

```typescript
interface PostComposerProps {
  currentUser: {
    id: string;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
    isPremium?: boolean;
  };
  userGroups?: Array<{
    id: string;
    name: string;
    imageUrl: string | null;
    handle: string;
    role: "admin" | "member";
  }>;
  onSubmit: (postData: PostData) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface PostData {
  content: string;
  type: "text" | "image" | "video" | "audio" | "link" | "media_sample" | "mixed";
  authorType: "user" | "group";
  authorId: string;
  visibility: "public" | "followers_only" | "group_members_only" | "private";
  mediaSampleId?: string;
  attachments?: File[];
  mentions?: Array<{
    type: "user" | "group";
    id: string;
    start: number;
    end: number;
  }>;
}
```

### Features

- **Character Limits**: 500 for regular users, 2000 for premium
- **Multi-modal Content**: Text, images, videos, audio samples
- **Polymorphic Authorship**: Post as user or group
- **Visibility Controls**: Public, followers only, private
- **Real-time Validation**: Character counting, file validation
- **Accessibility**: Full keyboard navigation, screen reader support

### Usage Examples

```tsx
// Basic usage
<PostComposer
  currentUser={currentUser}
  onSubmit={handleSubmit}
/>

// With group posting
<PostComposer
  currentUser={currentUser}
  userGroups={userGroups}
  onSubmit={handleSubmit}
  placeholder="What's happening in your band?"
/>

// With loading state
<PostComposer
  currentUser={currentUser}
  onSubmit={handleSubmit}
  isLoading={isSubmitting}
  disabled={isSubmitting}
/>
```

## PostCard

### Props

```typescript
interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onUnlike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
  showComments?: boolean;
  className?: string;
}

interface Post {
  id: string;
  content: string;
  type: "text" | "image" | "video" | "audio" | "link" | "media_sample" | "mixed";
  author: PostAuthor;
  visibility: "public" | "followers_only" | "group_members_only" | "private";
  createdAt: Date;
  updatedAt?: Date;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  attachments?: PostAttachment[];
  mediaSample?: AudioSample;
  canEdit: boolean;
  canDelete: boolean;
}
```

### Features

- **Content Types**: Support for all post types
- **Engagement Metrics**: Likes, comments, shares display
- **Media Previews**: Image, video, audio previews
- **Interaction Buttons**: Like, comment, share, bookmark
- **Action Menus**: Edit, delete, report options
- **Responsive Design**: Mobile-first responsive layout

### Usage Examples

```tsx
// Basic post card
<PostCard
  post={post}
  onLike={handleLike}
  onUnlike={handleUnlike}
  onComment={handleComment}
  onShare={handleShare}
  onBookmark={handleBookmark}
/>

// With edit/delete permissions
<PostCard
  post={post}
  onLike={handleLike}
  onUnlike={handleUnlike}
  onComment={handleComment}
  onShare={handleShare}
  onBookmark={handleBookmark}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// With custom styling
<PostCard
  post={post}
  {...handlers}
  className="border-2 border-primary"
/>
```

## PostFeed

### Props

```typescript
interface PostFeedProps {
  feedType?: "home" | "user" | "group" | "trending" | "following";
  userId?: string;
  groupId?: string;
  className?: string;
  showCreatePost?: boolean;
  emptyStateMessage?: string;
  emptyStateIcon?: React.ReactNode;
}
```

### Features

- **Multiple Feed Types**: Home, user, group, trending, following
- **Infinite Scroll**: Automatic pagination
- **Pull-to-Refresh**: Manual refresh functionality
- **Loading States**: Skeleton loading, load more indicators
- **Empty States**: Customizable empty state messages
- **Error Handling**: Network error recovery

### Usage Examples

```tsx
// Home feed
<PostFeed
  feedType="home"
  showCreatePost={true}
/>

// User profile feed
<PostFeed
  feedType="user"
  userId={userId}
  emptyStateMessage="No posts from this user yet"
/>

// Group feed
<PostFeed
  feedType="group"
  groupId={groupId}
  showCreatePost={canPostInGroup}
/>

// Trending feed
<PostFeed
  feedType="trending"
  emptyStateMessage="No trending posts at the moment"
/>
```

## MediaUpload

### Props

```typescript
interface MediaUploadProps {
  onFilesChange: (files: MediaFile[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number;
  disabled?: boolean;
  className?: string;
}

interface MediaFile {
  id: string;
  file: File;
  type: "image" | "video" | "audio" | "document";
  preview?: string;
  uploadProgress?: number;
  error?: string;
  uploaded?: boolean;
}
```

### Features

- **Drag & Drop**: Intuitive file dropping
- **File Validation**: Type and size validation
- **Progress Tracking**: Upload progress indicators
- **Error Handling**: Validation error messages
- **Preview Generation**: Image and video previews
- **Multiple Files**: Support for multiple file uploads

### File Type Limits

- **Images**: JPG, PNG, GIF, WebP (max 10MB)
- **Videos**: MP4, WebM (max 100MB)
- **Audio**: MP3, WAV, OGG (max 50MB)

### Usage Examples

```tsx
// Basic media upload
<MediaUpload
  onFilesChange={handleFilesChange}
/>

// Image only upload
<MediaUpload
  onFilesChange={handleFilesChange}
  acceptedTypes={["image/*"]}
  maxFiles={5}
/>

// Video upload with custom size limit
<MediaUpload
  onFilesChange={handleFilesChange}
  acceptedTypes={["video/*"]}
  maxFiles={1}
  maxFileSize={50 * 1024 * 1024} // 50MB
/>
```

## AudioSampleSelector

### Props

```typescript
interface AudioSampleSelectorProps {
  onSampleSelect: (sample: AudioSample) => void;
  onSampleRemove: () => void;
  selectedSample?: AudioSample | null;
  userSamples?: AudioSample[];
  disabled?: boolean;
  className?: string;
}

interface AudioSample {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
  };
  genre?: { id: string; name: string; };
  instrument?: { id: string; name: string; };
  bpm?: number;
  key?: string;
}
```

### Features

- **Sample Browser**: Browse user's audio samples
- **Search Functionality**: Search by title, genre, instrument
- **Inline Playback**: Play samples before selection
- **Metadata Display**: Genre, instrument, BPM, key info
- **Selection State**: Visual feedback for selected sample

### Usage Examples

```tsx
// Basic sample selector
<AudioSampleSelector
  onSampleSelect={handleSampleSelect}
  onSampleRemove={handleSampleRemove}
  userSamples={userSamples}
/>

// With selected sample
<AudioSampleSelector
  onSampleSelect={handleSampleSelect}
  onSampleRemove={handleSampleRemove}
  selectedSample={selectedSample}
  userSamples={userSamples}
/>

// Disabled state
<AudioSampleSelector
  onSampleSelect={handleSampleSelect}
  onSampleRemove={handleSampleRemove}
  userSamples={userSamples}
  disabled={true}
/>
```

## MentionAutocomplete

### Props

```typescript
interface MentionAutocompleteProps {
  query: string;
  onSelect: (item: MentionableItem) => void;
  onClose: () => void;
  position: { top: number; left: number };
  visible: boolean;
  className?: string;
}

type MentionableItem = MentionableUser | MentionableGroup;

interface MentionableUser {
  id: string;
  username: string;
  displayName: string | null;
  profileImageUrl: string | null;
  type: "user";
}

interface MentionableGroup {
  id: string;
  name: string;
  handle: string;
  imageUrl: string | null;
  type: "group";
  memberCount?: number;
}
```

### Features

- **Real-time Search**: Search as user types
- **Keyboard Navigation**: Arrow keys, Enter, Escape
- **Position Aware**: Smart popup positioning
- **User & Group Search**: Both users and groups
- **Visual Feedback**: Highlight selected item

### Usage Examples

```tsx
// Basic mention autocomplete
<MentionAutocomplete
  query={mentionQuery}
  onSelect={handleMentionSelect}
  onClose={handleMentionClose}
  position={{ top: 100, left: 50 }}
  visible={showMentions}
/>

// With custom styling
<MentionAutocomplete
  query={mentionQuery}
  onSelect={handleMentionSelect}
  onClose={handleMentionClose}
  position={{ top: 100, left: 50 }}
  visible={showMentions}
  className="border-2 border-primary"
/>
```

### useMentions Hook

```typescript
interface MentionsHook {
  mentions: Array<{
    id: string;
    type: "user" | "group";
    username: string;
    displayName: string;
    start: number;
    end: number;
  }>;
  addMention: (item: MentionableItem, start: number, end: number, displayName: string) => void;
  removeMention: (id: string) => void;
  updateMentionPositions: (textChange: {
    start: number;
    end: number;
    insertedText: string;
  }) => void;
  setMentions: (mentions: Array<any>) => void;
}

// Usage
const { mentions, addMention, removeMention, updateMentionPositions } = useMentions();
```

## CommentThread

### Props

```typescript
interface CommentThreadProps {
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  onUnlikeComment: (commentId: string) => Promise<void>;
  onReportComment: (commentId: string) => Promise<void>;
  currentUser: {
    id: string;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
  };
  loading?: boolean;
  className?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
  };
  parentCommentId?: string;
  replies?: Comment[];
  canEdit: boolean;
  canDelete: boolean;
}
```

### Features

- **Nested Comments**: Support for comment replies
- **Inline Editing**: Edit comments in place
- **Like Comments**: Like/unlike individual comments
- **Real-time Updates**: Live comment updates
- **Permissions**: Edit/delete based on permissions
- **Character Limits**: 500 character limit for comments

### Usage Examples

```tsx
// Basic comment thread
<CommentThread
  postId={postId}
  comments={comments}
  onAddComment={handleAddComment}
  onEditComment={handleEditComment}
  onDeleteComment={handleDeleteComment}
  onLikeComment={handleLikeComment}
  onUnlikeComment={handleUnlikeComment}
  onReportComment={handleReportComment}
  currentUser={currentUser}
/>

// With loading state
<CommentThread
  postId={postId}
  comments={comments}
  {...handlers}
  currentUser={currentUser}
  loading={isLoadingComments}
/>
```

## ShareModal

### Props

```typescript
interface ShareModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onShare: (type: "repost" | "repost_with_comment", comment?: string) => Promise<void>;
  currentUser: {
    id: string;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
  };
}
```

### Features

- **Multiple Share Types**: Repost, quote post, external sharing
- **Social Media Integration**: Twitter, Facebook, email sharing
- **Link Copying**: Copy post URL to clipboard
- **Post Preview**: Preview of shared content
- **Quote Comments**: Add comments to shared posts

### Usage Examples

```tsx
// Basic share modal
<ShareModal
  post={post}
  isOpen={isShareModalOpen}
  onClose={() => setIsShareModalOpen(false)}
  onShare={handleShare}
  currentUser={currentUser}
/>

// With share callback
<ShareModal
  post={post}
  isOpen={isShareModalOpen}
  onClose={() => setIsShareModalOpen(false)}
  onShare={async (type, comment) => {
    await sharePost(post.id, type, comment);
    setIsShareModalOpen(false);
  }}
  currentUser={currentUser}
/>
```

## Common Patterns

### Error Handling

```tsx
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (data: any) => {
  try {
    setError(null);
    await submitData(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : "An error occurred");
  }
};

// Display error
{error && (
  <div className="text-red-500 text-sm mt-2">
    {error}
  </div>
)}
```

### Loading States

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await performAction();
  } finally {
    setIsLoading(false);
  }
};

// Button with loading state
<Button disabled={isLoading}>
  {isLoading ? (
    <Loader2 className="h-4 w-4 animate-spin mr-2" />
  ) : (
    <Send className="h-4 w-4 mr-2" />
  )}
  {isLoading ? "Submitting..." : "Submit"}
</Button>
```

### Optimistic Updates

```tsx
const handleLike = async (postId: string) => {
  // Optimistic update
  setPosts(prev => prev.map(post => 
    post.id === postId 
      ? { ...post, isLiked: true, likesCount: post.likesCount + 1 }
      : post
  ));
  
  try {
    await likePost(postId);
  } catch (error) {
    // Revert on error
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: false, likesCount: post.likesCount - 1 }
        : post
    ));
  }
};
```

## Accessibility Features

### Keyboard Navigation

All components support full keyboard navigation:
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and links
- **Arrow Keys**: Navigate lists and menus
- **Escape**: Close modals and dropdowns

### Screen Reader Support

Components include proper ARIA attributes:
- **aria-label**: Descriptive labels for buttons
- **aria-describedby**: Additional descriptions
- **role**: Semantic roles for elements
- **aria-expanded**: State for expandable elements

### Color Contrast

All components meet WCAG AA color contrast requirements:
- **Text**: 4.5:1 contrast ratio
- **Interactive Elements**: 3:1 contrast ratio
- **Focus Indicators**: High contrast focus rings

### Focus Management

Proper focus management throughout:
- **Modal Focus**: Trap focus in modals
- **Focus Restoration**: Restore focus after actions
- **Skip Links**: Skip to main content
- **Focus Indicators**: Clear focus indicators

## Performance Optimizations

### Memoization

```tsx
import { memo, useMemo, useCallback } from 'react';

const PostCard = memo(({ post, onLike, onUnlike }) => {
  const formattedTime = useMemo(() => 
    formatTimeAgo(post.createdAt), 
    [post.createdAt]
  );

  const handleLike = useCallback(() => {
    if (post.isLiked) {
      onUnlike(post.id);
    } else {
      onLike(post.id);
    }
  }, [post.isLiked, post.id, onLike, onUnlike]);

  return (
    // Component JSX
  );
});
```

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const ShareModal = lazy(() => import('./share-modal'));

// Usage
<Suspense fallback={<div>Loading...</div>}>
  <ShareModal {...props} />
</Suspense>
```

### Virtual Scrolling

For large lists, consider virtual scrolling:

```tsx
import { FixedSizeList as List } from 'react-window';

const VirtualizedFeed = ({ posts }) => (
  <List
    height={600}
    itemCount={posts.length}
    itemSize={200}
    itemData={posts}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <PostCard post={data[index]} {...handlers} />
      </div>
    )}
  </List>
);
```

## Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from './post-card';

test('renders post content', () => {
  const post = {
    id: '1',
    content: 'Test post',
    // ... other props
  };

  render(<PostCard post={post} {...handlers} />);
  
  expect(screen.getByText('Test post')).toBeInTheDocument();
});

test('handles like action', () => {
  const onLike = jest.fn();
  const post = { id: '1', isLiked: false, /* ... */ };

  render(<PostCard post={post} onLike={onLike} {...otherHandlers} />);
  
  fireEvent.click(screen.getByRole('button', { name: /like/i }));
  
  expect(onLike).toHaveBeenCalledWith('1');
});
```

### Integration Tests

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostFeed } from './post-feed';

test('loads and displays posts', async () => {
  render(<PostFeed feedType="home" />);
  
  await waitFor(() => {
    expect(screen.getByText('Home Feed')).toBeInTheDocument();
  });
  
  await waitFor(() => {
    expect(screen.getByText('Test post')).toBeInTheDocument();
  });
});
```

This comprehensive API reference provides all the information needed to use the posts UI components effectively.