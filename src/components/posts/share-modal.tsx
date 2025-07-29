"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Share2,
  Link,
  Copy,
  Twitter,
  Facebook,
  MessageCircle,
  Mail,
  Download,
  Check,
  ExternalLink,
  Users,
  User,
  Send,
  Loader2,
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
    name: string;
    handle: string;
    imageUrl: string | null;
  };
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  attachments?: Array<{
    id: string;
    type: "image" | "video" | "audio" | "document";
    url: string;
  }>;
  mediaSample?: {
    id: string;
    title: string;
    audioUrl: string;
  };
}

interface ShareModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onShare: (
    type: "repost" | "repost_with_comment",
    comment?: string,
  ) => Promise<void>;
  currentUser: {
    id: string;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
  };
}

export function ShareModal({
  post,
  isOpen,
  onClose,
  onShare,
  currentUser,
}: ShareModalProps) {
  const [shareType, setShareType] = useState<
    "repost" | "repost_with_comment" | "external"
  >("repost");
  const [comment, setComment] = useState("");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const postUrl = `${window.location.origin}/post/${post.id}`;

  const handleShare = async (type: "repost" | "repost_with_comment") => {
    setSharing(true);
    try {
      await onShare(type, type === "repost_with_comment" ? comment : undefined);
      onClose();
      setComment("");
    } catch (error) {
      console.error("Failed to share post:", error);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleExternalShare = (platform: string) => {
    const text = `Check out this post by ${post.author.name}: ${post.content.substring(0, 100)}${post.content.length > 100 ? "..." : ""}`;
    const url = encodeURIComponent(postUrl);
    const encodedText = encodeURIComponent(text);

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=Check out this post&body=${encodedText}%0A%0A${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Post
          </DialogTitle>
          <DialogDescription>
            Choose how you&apos;d like to share this post
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Type Selector */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button
              variant={shareType === "repost" ? "default" : "outline"}
              onClick={() => setShareType("repost")}
              className="flex h-20 flex-col gap-2"
            >
              <Share2 className="h-5 w-5" />
              <span className="text-sm">Repost</span>
            </Button>
            <Button
              variant={
                shareType === "repost_with_comment" ? "default" : "outline"
              }
              onClick={() => setShareType("repost_with_comment")}
              className="flex h-20 flex-col gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">Quote Post</span>
            </Button>
            <Button
              variant={shareType === "external" ? "default" : "outline"}
              onClick={() => setShareType("external")}
              className="flex h-20 flex-col gap-2"
            >
              <ExternalLink className="h-5 w-5" />
              <span className="text-sm">External</span>
            </Button>
          </div>

          {/* Content based on share type */}
          {shareType === "repost" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.profileImageUrl ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">
                      {currentUser.displayName ?? currentUser.username}
                    </span>{" "}
                    shared a post
                  </p>
                  <p className="text-muted-foreground text-xs">
                    @{currentUser.username}
                  </p>
                </div>
              </div>

              <div className="border-primary border-l-4 pl-4">
                <PostPreview post={post} />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleShare("repost")}
                  disabled={sharing}
                  className="flex-1"
                >
                  {sharing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Share2 className="mr-2 h-4 w-4" />
                  )}
                  Repost
                </Button>
                <Button variant="outline" onClick={onClose} disabled={sharing}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {shareType === "repost_with_comment" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.profileImageUrl ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your thoughts..."
                    className="min-h-[80px] resize-none"
                    maxLength={500}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      {500 - comment.length} characters remaining
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-primary border-l-4 pl-4">
                <PostPreview post={post} />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleShare("repost_with_comment")}
                  disabled={sharing}
                  className="flex-1"
                >
                  {sharing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Quote Post
                </Button>
                <Button variant="outline" onClick={onClose} disabled={sharing}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {shareType === "external" && (
            <div className="space-y-4">
              <PostPreview post={post} />

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Copy Link</h4>
                <div className="flex items-center gap-2">
                  <div className="bg-muted flex-1 truncate rounded p-2 font-mono text-sm">
                    {postUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    disabled={copied}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Share on Social Media</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Button
                    variant="outline"
                    onClick={() => handleExternalShare("twitter")}
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExternalShare("facebook")}
                    className="flex items-center gap-2"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExternalShare("email")}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PostPreview({ post }: { post: Post }) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.author.imageUrl ?? undefined} />
            <AvatarFallback className="text-xs">
              {post.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{post.author.name}</span>
              <Badge variant="outline" className="text-xs">
                {post.author.type === "user" ? (
                  <User className="mr-1 h-3 w-3" />
                ) : (
                  <Users className="mr-1 h-3 w-3" />
                )}
                {post.author.type === "user" ? "User" : "Group"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              {post.author.handle}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm leading-relaxed">
            {post.content.length > 150
              ? `${post.content.substring(0, 150)}...`
              : post.content}
          </p>
          {post.attachments && post.attachments.length > 0 && (
            <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
              <span>
                +{post.attachments.length} attachment
                {post.attachments.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {post.mediaSample && (
            <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
              <span>Audio sample: {post.mediaSample.title}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
