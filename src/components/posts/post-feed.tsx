"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PostCard } from "./post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw,
  Loader2,
  MessageSquare,
  TrendingUp,
  Users,
  AlertCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  type:
    | "text"
    | "image"
    | "video"
    | "audio"
    | "link"
    | "media_sample"
    | "mixed";
  author: {
    id: string;
    type: "user" | "group";
    username?: string;
    name: string;
    handle: string;
    imageUrl: string | null;
    memberCount?: number;
  };
  visibility: "public" | "followers_only" | "group_members_only" | "private";
  createdAt: Date;
  updatedAt?: Date;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  attachments?: Array<{
    id: string;
    type: "image" | "video" | "audio" | "document";
    url: string;
    filename?: string;
    altText?: string;
    caption?: string;
    width?: number;
    height?: number;
    duration?: number;
  }>;
  mediaSample?: {
    id: string;
    title: string;
    audioUrl: string;
    duration: number;
    user: {
      username: string;
      displayName: string | null;
    };
    genre?: string;
    instrument?: string;
  };
  canEdit: boolean;
  canDelete: boolean;
}

interface PostFeedProps {
  feedType?: "home" | "user" | "group" | "trending" | "following";
  userId?: string;
  groupId?: string;
  className?: string;
  showCreatePost?: boolean;
  emptyStateMessage?: string;
  emptyStateIcon?: React.ReactNode;
}

export function PostFeed({
  feedType = "home",
  userId,
  groupId,
  className,
  showCreatePost = false,
  emptyStateMessage,
  emptyStateIcon,
}: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Mock data for demo
  const mockPosts: Post[] = [
    {
      id: "1",
      content:
        "Just finished recording this amazing guitar riff! What do you think? 🎸",
      type: "media_sample",
      author: {
        id: "1",
        type: "user",
        username: "john_guitarist",
        name: "John Doe",
        handle: "@john_guitarist",
        imageUrl: null,
      },
      visibility: "public",
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      likesCount: 24,
      commentsCount: 8,
      sharesCount: 3,
      isLiked: false,
      isBookmarked: false,
      mediaSample: {
        id: "1",
        title: "Blues Rock Riff",
        audioUrl: "/audio/sample1.mp3",
        duration: 45,
        user: {
          username: "john_guitarist",
          displayName: "John Doe",
        },
        genre: "Rock",
        instrument: "Guitar",
      },
      canEdit: true,
      canDelete: true,
    },
    {
      id: "2",
      content:
        "Looking for a drummer to complete our band! We're a rock/alternative group based in San Francisco. DM me if interested! 🥁",
      type: "text",
      author: {
        id: "2",
        type: "group",
        name: "The Sound Collective",
        handle: "@soundcollective",
        imageUrl: null,
        memberCount: 156,
      },
      visibility: "public",
      createdAt: new Date(Date.now() - 7200000), // 2 hours ago
      likesCount: 42,
      commentsCount: 15,
      sharesCount: 8,
      isLiked: true,
      isBookmarked: false,
      canEdit: false,
      canDelete: false,
    },
    {
      id: "3",
      content:
        "Check out this amazing sunset from our outdoor concert last night! The energy was incredible 🌅",
      type: "image",
      author: {
        id: "3",
        type: "user",
        username: "sarah_music",
        name: "Sarah Johnson",
        handle: "@sarah_music",
        imageUrl: null,
      },
      visibility: "public",
      createdAt: new Date(Date.now() - 10800000), // 3 hours ago
      likesCount: 128,
      commentsCount: 23,
      sharesCount: 12,
      isLiked: false,
      isBookmarked: true,
      attachments: [
        {
          id: "1",
          type: "image",
          url: "/images/concert-sunset.jpg",
          altText: "Sunset during outdoor concert",
          caption: "What a beautiful night for music!",
        },
      ],
      canEdit: true,
      canDelete: true,
    },
  ];

  const loadPosts = useCallback(
    async (pageNum = 0, refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else if (pageNum === 0) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError(null);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate getting posts based on feed type
        let newPosts: Post[] = [];
        if (pageNum === 0) {
          newPosts = mockPosts;
        } else {
          // Simulate pagination - return empty for now
          newPosts = [];
          setHasMore(false);
        }

        if (refresh || pageNum === 0) {
          setPosts(newPosts);
          setPage(0);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        setPage(pageNum);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [feedType, userId, groupId],
  );

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      void loadPosts(page + 1);
    }
  }, [loadPosts, page, loadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 1.0 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loadingMore]);

  // Initial load
  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleRefresh = () => {
    void loadPosts(0, true);
  };

  const handleLike = async (postId: string) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isLiked: true, likesCount: post.likesCount + 1 }
          : post,
      ),
    );

    // TODO: API call
  };

  const handleUnlike = async (postId: string) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: false,
              likesCount: Math.max(0, post.likesCount - 1),
            }
          : post,
      ),
    );

    // TODO: API call
  };

  const handleComment = (postId: string) => {
    // TODO: Open comment modal or navigate to post detail
    console.log("Comment on post:", postId);
  };

  const handleShare = (postId: string) => {
    // TODO: Open share modal
    console.log("Share post:", postId);
  };

  const handleBookmark = async (postId: string) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post,
      ),
    );

    // TODO: API call
  };

  const handleEdit = (postId: string) => {
    // TODO: Open edit modal
    console.log("Edit post:", postId);
  };

  const handleDelete = (postId: string) => {
    // TODO: Show confirmation dialog
    console.log("Delete post:", postId);
  };

  const handleReport = (postId: string) => {
    // TODO: Show report modal
    console.log("Report post:", postId);
  };

  const getFeedIcon = () => {
    switch (feedType) {
      case "trending":
        return <TrendingUp className="h-5 w-5" />;
      case "following":
        return <Users className="h-5 w-5" />;
      case "group":
        return <Users className="h-5 w-5" />;
      case "user":
        return <Users className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getFeedTitle = () => {
    switch (feedType) {
      case "trending":
        return "Trending Posts";
      case "following":
        return "Following";
      case "group":
        return "Group Posts";
      case "user":
        return "User Posts";
      default:
        return "Home Feed";
    }
  };

  const getEmptyStateMessage = () => {
    if (emptyStateMessage) return emptyStateMessage;

    switch (feedType) {
      case "trending":
        return "No trending posts at the moment. Check back later!";
      case "following":
        return "No posts from people you follow yet. Start following more users!";
      case "group":
        return "No posts in this group yet. Be the first to share something!";
      case "user":
        return "No posts from this user yet.";
      default:
        return "No posts in your feed yet. Start following people or join groups!";
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="text-destructive mb-4 h-8 w-8" />
              <h3 className="mb-2 text-lg font-semibold">
                Error Loading Posts
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Feed Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFeedIcon()}
              <h2 className="text-lg font-semibold">{getFeedTitle()}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn("h-4 w-4", refreshing && "animate-spin")}
              />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              {emptyStateIcon ?? (
                <MessageSquare className="text-muted-foreground mb-4 h-12 w-12" />
              )}
              <h3 className="mb-2 text-lg font-semibold">No Posts Yet</h3>
              <p className="text-muted-foreground max-w-md">
                {getEmptyStateMessage()}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div key={post.id}>
              <PostCard
                post={post}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onComment={handleComment}
                onShare={handleShare}
                onBookmark={handleBookmark}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReport={handleReport}
              />
              {index < posts.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {loadingMore && (
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          )}
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-center">
              <p className="text-sm">You&apos;ve reached the end of the feed</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
