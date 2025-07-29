"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  Edit,
  Trash2,
  Flag,
  ExternalLink,
  Users,
  User,
  Globe,
  Lock,
  UserCheck,
  Clock,
  Music,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PostAuthor {
  id: string;
  type: "user" | "group";
  username?: string;
  name: string;
  handle: string;
  imageUrl: string | null;
  memberCount?: number;
}

interface PostAttachment {
  id: string;
  type: "image" | "video" | "audio" | "document";
  url: string;
  filename?: string;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface AudioSample {
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
}

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
  author: PostAuthor;
  visibility: "public" | "followers_only" | "group_members_only" | "private";
  createdAt: Date;
  updatedAt?: Date;

  // Engagement metrics
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;

  // Media
  attachments?: PostAttachment[];
  mediaSample?: AudioSample;

  // Permissions
  canEdit: boolean;
  canDelete: boolean;
}

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

export function PostCard({
  post,
  onLike,
  onUnlike,
  onComment,
  onShare,
  onBookmark,
  onEdit,
  onDelete,
  onReport,
  showComments = false,
  className,
}: PostCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const formatCount = (count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${Math.floor(count / 100) / 10}k`;
    return `${Math.floor(count / 100000) / 10}M`;
  };

  const renderContent = () => {
    const contentLines = post.content.split("\n");
    const shouldTruncate = contentLines.length > 4 || post.content.length > 400;

    if (shouldTruncate && !showFullContent) {
      const truncatedContent = contentLines.slice(0, 3).join("\n");
      return (
        <div className="space-y-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {truncatedContent}...
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullContent(true)}
            className="text-primary hover:text-primary h-auto p-0"
          >
            Show more
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        {shouldTruncate && showFullContent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullContent(false)}
            className="text-primary hover:text-primary h-auto p-0"
          >
            Show less
          </Button>
        )}
      </div>
    );
  };

  const renderAttachments = () => {
    if (!post.attachments || post.attachments.length === 0) return null;

    return (
      <div className="space-y-2">
        {post.attachments.map((attachment) => (
          <div key={attachment.id} className="overflow-hidden rounded-lg">
            {attachment.type === "image" && (
              <Image
                src={attachment.url}
                alt={attachment.altText ?? "Post image"}
                className="max-h-96 w-full object-cover"
              />
            )}
            {attachment.type === "video" && (
              <video
                src={attachment.url}
                controls
                className="max-h-96 w-full"
                poster={attachment.url + "?thumbnail"}
              />
            )}
            {attachment.type === "audio" && (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="h-10 w-10 p-0"
                  >
                    {isPlayingAudio ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {attachment.filename ?? "Audio file"}
                    </p>
                    {attachment.duration && (
                      <p className="text-muted-foreground text-xs">
                        {Math.floor(attachment.duration / 60)}:
                        {(attachment.duration % 60).toString().padStart(2, "0")}
                      </p>
                    )}
                  </div>
                  <Volume2 className="text-muted-foreground h-4 w-4" />
                </div>
              </div>
            )}
            {attachment.caption && (
              <p className="text-muted-foreground mt-2 px-1 text-xs">
                {attachment.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMediaSample = () => {
    if (!post.mediaSample) return null;

    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">
                  {post.mediaSample.title}
                </h4>
                <Badge variant="outline" className="text-xs">
                  Sample
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                by @{post.mediaSample.user.username}
                {post.mediaSample.genre && ` • ${post.mediaSample.genre}`}
                {post.mediaSample.instrument &&
                  ` • ${post.mediaSample.instrument}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="h-10 w-10 p-0"
            >
              {isPlayingAudio ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case "public":
        return <Globe className="h-3 w-3" />;
      case "followers_only":
        return <UserCheck className="h-3 w-3" />;
      case "group_members_only":
        return <Users className="h-3 w-3" />;
      case "private":
        return <Lock className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  const getTypeIcon = () => {
    switch (post.type) {
      case "image":
        return <ImageIcon className="h-3 w-3" />;
      case "video":
        return <Video className="h-3 w-3" />;
      case "audio":
        return <Music className="h-3 w-3" />;
      case "media_sample":
        return <Music className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card
      className={cn("hover:bg-accent/5 w-full transition-colors", className)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Author Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.imageUrl ?? undefined} />
              <AvatarFallback>
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Author Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {post.author.name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {post.author.type === "user" ? (
                    <User className="mr-1 h-3 w-3" />
                  ) : (
                    <Users className="mr-1 h-3 w-3" />
                  )}
                  {post.author.type === "user" ? "User" : "Group"}
                </Badge>
                {post.author.memberCount && (
                  <span className="text-muted-foreground text-xs">
                    {post.author.memberCount.toLocaleString()} members
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {post.author.handle}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-muted-foreground text-xs">
                    {formatTimeAgo(post.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {getVisibilityIcon()}
                  {getTypeIcon()}
                </div>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {post.canEdit && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(post.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {post.canDelete && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(post.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
              {!post.canEdit && !post.canDelete && onReport && (
                <DropdownMenuItem onClick={() => onReport(post.id)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                Copy link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content */}
        {post.content && renderContent()}

        {/* Media Sample */}
        {renderMediaSample()}

        {/* Attachments */}
        {renderAttachments()}

        <Separator />

        {/* Engagement Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                post.isLiked ? onUnlike(post.id) : onLike(post.id)
              }
              className={cn(
                "flex items-center gap-2",
                post.isLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-muted-foreground",
              )}
            >
              <Heart
                className={cn("h-4 w-4", post.isLiked && "fill-current")}
              />
              <span className="text-sm">{formatCount(post.likesCount)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment(post.id)}
              className="text-muted-foreground flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{formatCount(post.commentsCount)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(post.id)}
              className="text-muted-foreground flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">{formatCount(post.sharesCount)}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmark(post.id)}
            className={cn(
              "h-8 w-8 p-0",
              post.isBookmarked
                ? "text-blue-500 hover:text-blue-600"
                : "text-muted-foreground",
            )}
          >
            <Bookmark
              className={cn("h-4 w-4", post.isBookmarked && "fill-current")}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
