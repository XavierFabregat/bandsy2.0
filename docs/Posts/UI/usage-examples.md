# Posts UI Usage Examples

## Complete Post Creation Flow

### Basic Post Creation

```tsx
import { useState } from 'react';
import { PostComposer } from '@/components/posts';
import { createPost } from '@/server/posts/mutations';

function CreatePostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (postData: PostData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createPost(postData);
      // Redirect or show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      
      <PostComposer
        currentUser={currentUser}
        userGroups={userGroups}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        placeholder="Share your musical thoughts..."
      />
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
```

### Advanced Post Creation with Media

```tsx
import { useState } from 'react';
import { PostComposer, MediaUpload, AudioSampleSelector } from '@/components/posts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function AdvancedPostCreator() {
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showSampleSelector, setShowSampleSelector] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedSample, setSelectedSample] = useState<AudioSample | null>(null);

  const handleSubmit = async (postData: PostData) => {
    // Include media files and sample in submission
    const finalPostData = {
      ...postData,
      attachments: selectedFiles,
      mediaSampleId: selectedSample?.id,
    };

    await createPost(finalPostData);
    
    // Reset form
    setSelectedFiles([]);
    setSelectedSample(null);
  };

  return (
    <div className="space-y-4">
      <PostComposer
        currentUser={currentUser}
        userGroups={userGroups}
        onSubmit={handleSubmit}
      />

      {/* Media Upload Modal */}
      <Dialog open={showMediaUpload} onOpenChange={setShowMediaUpload}>
        <DialogTrigger asChild>
          <Button variant="outline">
            Add Media
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          <MediaUpload
            onFilesChange={setSelectedFiles}
            maxFiles={5}
            acceptedTypes={['image/*', 'video/*']}
          />
        </DialogContent>
      </Dialog>

      {/* Audio Sample Selector Modal */}
      <Dialog open={showSampleSelector} onOpenChange={setShowSampleSelector}>
        <DialogTrigger asChild>
          <Button variant="outline">
            Add Audio Sample
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Audio Sample</DialogTitle>
          </DialogHeader>
          <AudioSampleSelector
            onSampleSelect={setSelectedSample}
            onSampleRemove={() => setSelectedSample(null)}
            selectedSample={selectedSample}
            userSamples={userSamples}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## Post Display and Interaction

### Basic Post Feed

```tsx
import { PostFeed } from '@/components/posts';
import { usePostInteractions } from '@/hooks/usePostInteractions';

function HomePage() {
  const {
    handleLike,
    handleUnlike,
    handleComment,
    handleShare,
    handleBookmark,
  } = usePostInteractions();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Home Feed</h1>
      
      <PostFeed
        feedType="home"
        showCreatePost={true}
        emptyStateMessage="Your feed is empty. Start following people to see their posts!"
      />
    </div>
  );
}
```

### User Profile with Posts

```tsx
import { useState } from 'react';
import { PostFeed, PostCard } from '@/components/posts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

function UserProfile({ user }: { user: UserProfile }) {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* User Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <img 
            src={user.profileImageUrl || '/default-avatar.png'} 
            alt={user.displayName || user.username}
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">
              {user.displayName || user.username}
            </h1>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
        </div>
        
        {user.bio && (
          <p className="mt-4 text-gray-600">{user.bio}</p>
        )}
      </div>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
          <TabsTrigger value="liked">Liked</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <PostFeed
            feedType="user"
            userId={user.id}
            emptyStateMessage="No posts from this user yet."
          />
        </TabsContent>

        <TabsContent value="samples" className="mt-6">
          {/* Audio samples content */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">Audio samples coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="liked" className="mt-6">
          <PostFeed
            feedType="user"
            userId={user.id}
            emptyStateMessage="No liked posts to show."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Group Posts with Permissions

```tsx
import { useState } from 'react';
import { PostFeed, PostComposer } from '@/components/posts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function GroupPage({ group, userMembership }: { 
  group: Group; 
  userMembership: GroupMembership | null;
}) {
  const [showComposer, setShowComposer] = useState(false);
  const canPost = userMembership?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Group Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={group.imageUrl || '/default-group.png'} 
                alt={group.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <CardTitle className="text-xl">{group.name}</CardTitle>
                <p className="text-muted-foreground">@{group.handle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    {group.memberCount} members
                  </Badge>
                  {userMembership && (
                    <Badge variant={userMembership.role === 'admin' ? 'default' : 'outline'}>
                      {userMembership.role}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!userMembership && (
              <Button>Join Group</Button>
            )}
          </div>
        </CardHeader>
        {group.description && (
          <CardContent>
            <p className="text-sm text-gray-600">{group.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Post Creation */}
      {canPost && (
        <div className="mb-6">
          {showComposer ? (
            <PostComposer
              currentUser={currentUser}
              userGroups={[group]}
              onSubmit={async (postData) => {
                await createPost(postData);
                setShowComposer(false);
              }}
              placeholder={`Share something with ${group.name}...`}
            />
          ) : (
            <Card>
              <CardContent className="p-4">
                <Button 
                  onClick={() => setShowComposer(true)}
                  className="w-full"
                  variant="outline"
                >
                  Share something with the group...
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Group Posts */}
      <PostFeed
        feedType="group"
        groupId={group.id}
        emptyStateMessage="No posts in this group yet. Be the first to share something!"
      />
    </div>
  );
}
```

## Comment System Integration

### Post with Comments

```tsx
import { useState } from 'react';
import { PostCard, CommentThread } from '@/components/posts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

function PostWithComments({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const postComments = await fetchComments(post.id);
      setComments(postComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (postId: string, content: string, parentId?: string) => {
    const newComment = await createComment(postId, content, parentId);
    setComments(prev => [...prev, newComment]);
  };

  const handleEditComment = async (commentId: string, content: string) => {
    const updatedComment = await updateComment(commentId, content);
    setComments(prev => prev.map(comment => 
      comment.id === commentId ? updatedComment : comment
    ));
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  return (
    <div className="space-y-4">
      <PostCard
        post={post}
        onLike={handleLike}
        onUnlike={handleUnlike}
        onComment={toggleComments}
        onShare={handleShare}
        onBookmark={handleBookmark}
      />

      {/* Comments Section */}
      {post.commentsCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <Button
              variant="ghost"
              onClick={toggleComments}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                {post.commentsCount} Comments
              </span>
              {showComments ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showComments && (
              <div className="mt-4 pt-4 border-t">
                <CommentThread
                  postId={post.id}
                  comments={comments}
                  onAddComment={handleAddComment}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                  onLikeComment={handleLikeComment}
                  onUnlikeComment={handleUnlikeComment}
                  onReportComment={handleReportComment}
                  currentUser={currentUser}
                  loading={loadingComments}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## Advanced Interaction Patterns

### Share Modal Integration

```tsx
import { useState } from 'react';
import { PostCard, ShareModal } from '@/components/posts';
import { toast } from 'sonner';

function PostWithSharing({ post }: { post: Post }) {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = async (type: 'repost' | 'repost_with_comment', comment?: string) => {
    try {
      await sharePost(post.id, type, comment);
      toast.success('Post shared successfully!');
      setShowShareModal(false);
    } catch (error) {
      toast.error('Failed to share post');
    }
  };

  return (
    <>
      <PostCard
        post={post}
        onLike={handleLike}
        onUnlike={handleUnlike}
        onComment={handleComment}
        onShare={() => setShowShareModal(true)}
        onBookmark={handleBookmark}
      />

      <ShareModal
        post={post}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
        currentUser={currentUser}
      />
    </>
  );
}
```

### Mention Integration

```tsx
import { useState, useCallback } from 'react';
import { PostComposer, MentionAutocomplete, useMentions } from '@/components/posts';

function PostComposerWithMentions() {
  const [content, setContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const { mentions, addMention, updateMentionPositions } = useMentions();

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const selectionStart = e.target.selectionStart;
    
    // Track text changes for mention position updates
    const textChange = {
      start: selectionStart,
      end: selectionStart,
      insertedText: newContent.slice(selectionStart, selectionStart + (newContent.length - content.length)),
    };
    
    updateMentionPositions(textChange);
    setContent(newContent);

    // Check for @ mentions
    const textBeforeCursor = newContent.substring(0, selectionStart);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (textAfterAt.match(/^[a-zA-Z0-9_]*$/)) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        
        // Calculate position for mention popup
        const rect = e.target.getBoundingClientRect();
        setMentionPosition({
          top: rect.top + 20,
          left: rect.left + (textBeforeCursor.length * 8), // Approximate character width
        });
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  }, [content, updateMentionPositions]);

  const handleMentionSelect = useCallback((item: MentionableItem) => {
    const mentionText = `@${item.type === 'user' ? item.username : item.handle}`;
    const lastAtIndex = content.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const beforeMention = content.substring(0, lastAtIndex);
      const afterMention = content.substring(lastAtIndex + mentionQuery.length + 1);
      const newContent = beforeMention + mentionText + ' ' + afterMention;
      
      setContent(newContent);
      addMention(
        item,
        lastAtIndex,
        lastAtIndex + mentionText.length,
        item.type === 'user' ? item.displayName || item.username : item.name
      );
    }
    
    setShowMentions(false);
  }, [content, mentionQuery, addMention]);

  return (
    <div className="relative">
      <PostComposer
        currentUser={currentUser}
        onSubmit={async (postData) => {
          await createPost({
            ...postData,
            content,
            mentions: mentions.map(m => ({
              type: m.type,
              id: m.id,
              start: m.start,
              end: m.end,
            })),
          });
          setContent('');
        }}
      />

      <MentionAutocomplete
        query={mentionQuery}
        onSelect={handleMentionSelect}
        onClose={() => setShowMentions(false)}
        position={mentionPosition}
        visible={showMentions}
      />
    </div>
  );
}
```

## Custom Hooks for Post Interactions

### usePostInteractions Hook

```tsx
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  likePost, 
  unlikePost, 
  bookmarkPost, 
  unbookmarkPost,
  sharePost 
} from '@/server/posts/mutations';

export function usePostInteractions() {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, any>>({});

  const handleLike = useCallback(async (postId: string) => {
    // Optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], isLiked: true, likesCount: (prev[postId]?.likesCount || 0) + 1 }
    }));

    try {
      await likePost(postId);
      toast.success('Post liked!');
    } catch (error) {
      // Revert optimistic update
      setOptimisticUpdates(prev => ({
        ...prev,
        [postId]: { ...prev[postId], isLiked: false, likesCount: (prev[postId]?.likesCount || 1) - 1 }
      }));
      toast.error('Failed to like post');
    }
  }, []);

  const handleUnlike = useCallback(async (postId: string) => {
    setOptimisticUpdates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], isLiked: false, likesCount: Math.max(0, (prev[postId]?.likesCount || 1) - 1) }
    }));

    try {
      await unlikePost(postId);
    } catch (error) {
      setOptimisticUpdates(prev => ({
        ...prev,
        [postId]: { ...prev[postId], isLiked: true, likesCount: (prev[postId]?.likesCount || 0) + 1 }
      }));
      toast.error('Failed to unlike post');
    }
  }, []);

  const handleBookmark = useCallback(async (postId: string) => {
    setOptimisticUpdates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], isBookmarked: !prev[postId]?.isBookmarked }
    }));

    try {
      const isBookmarked = optimisticUpdates[postId]?.isBookmarked;
      if (isBookmarked) {
        await unbookmarkPost(postId);
        toast.success('Post removed from bookmarks');
      } else {
        await bookmarkPost(postId);
        toast.success('Post bookmarked!');
      }
    } catch (error) {
      // Revert optimistic update
      setOptimisticUpdates(prev => ({
        ...prev,
        [postId]: { ...prev[postId], isBookmarked: !prev[postId]?.isBookmarked }
      }));
      toast.error('Failed to update bookmark');
    }
  }, [optimisticUpdates]);

  return {
    handleLike,
    handleUnlike,
    handleBookmark,
    optimisticUpdates,
  };
}
```

### useInfiniteScroll Hook

```tsx
import { useState, useEffect, useCallback } from 'react';

export function useInfiniteScroll<T>(
  fetchFunction: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  deps: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(page);
      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, loading, hasMore, page]);

  const refresh = useCallback(async () => {
    setData([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    
    try {
      const result = await fetchFunction(0);
      setData(result.data);
      setHasMore(result.hasMore);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (data.length === 0) {
      loadMore();
    }
  }, deps);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}
```

## Error Handling and Loading States

### Error Boundary for Posts

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PostErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Post error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
              <p className="text-muted-foreground mb-4">
                There was an error displaying this post.
              </p>
              <Button
                onClick={() => this.setState({ hasError: false })}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Usage
<PostErrorBoundary>
  <PostCard post={post} {...handlers} />
</PostErrorBoundary>
```

### Loading Skeletons

```tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PostCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-40 w-full rounded-md" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

// Usage in PostFeed
{loading ? (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
) : (
  <PostFeed {...props} />
)}
```

These examples demonstrate comprehensive usage patterns for the posts UI system, from basic implementations to advanced features and error handling.