"use client";

import { useState, useRef, useEffect } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Heart,
  Reply,
  MoreHorizontal,
  Send,
  Edit,
  Trash2,
  Flag,
  Clock,
  User,
  Users,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface CommentThreadProps {
  postId: string;
  comments: Comment[];
  onAddComment: (
    postId: string,
    content: string,
    parentId?: string,
  ) => Promise<void>;
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

export function CommentThread({
  postId,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  onUnlikeComment,
  onReportComment,
  currentUser,
  loading = false,
  className,
}: CommentThreadProps) {
  const [newCommentContent, setNewCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState<Record<string, boolean>>(
    {},
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmitComment = async () => {
    if (!newCommentContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onAddComment(postId, newCommentContent.trim());
      setNewCommentContent("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onAddComment(postId, replyContent.trim(), parentId);
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onEditComment(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent("");
    } catch (error) {
      console.error("Failed to edit comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const startReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const toggleReplies = (commentId: string) => {
    setShowAllReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;
    const showReplies = showAllReplies[comment.id] ?? false;
    const maxDepth = 3;

    return (
      <div
        key={comment.id}
        className={cn(
          "space-y-3",
          depth > 0 && "border-muted ml-8 border-l-2 pl-4",
        )}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={comment.user.profileImageUrl ?? undefined} />
            <AvatarFallback className="text-xs">
              {comment.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Comment Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {comment.user.displayName ?? comment.user.username}
              </span>
              <span className="text-muted-foreground text-xs">
                @{comment.user.username}
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-muted-foreground text-xs">
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
              {comment.updatedAt && comment.updatedAt > comment.createdAt && (
                <Badge variant="secondary" className="text-xs">
                  Edited
                </Badge>
              )}
            </div>

            {/* Comment Text */}
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  ref={editTextareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] resize-none"
                  placeholder="Edit your comment..."
                  maxLength={500}
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditComment(comment.id)}
                    disabled={submitting || !editContent.trim()}
                  >
                    {submitting ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : null}
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEdit}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            )}

            {/* Comment Actions */}
            {!isEditing && (
              <div className="mt-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    comment.isLiked
                      ? onUnlikeComment(comment.id)
                      : onLikeComment(comment.id)
                  }
                  className={cn(
                    "h-7 gap-1 px-2",
                    comment.isLiked
                      ? "text-red-500 hover:text-red-600"
                      : "text-muted-foreground",
                  )}
                >
                  <Heart
                    className={cn("h-3 w-3", comment.isLiked && "fill-current")}
                  />
                  {comment.likesCount > 0 && (
                    <span className="text-xs">
                      {formatCount(comment.likesCount)}
                    </span>
                  )}
                </Button>

                {depth < maxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startReply(comment.id)}
                    className="text-muted-foreground h-7 gap-1 px-2"
                  >
                    <Reply className="h-3 w-3" />
                    Reply
                  </Button>
                )}

                {comment.repliesCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplies(comment.id)}
                    className="text-muted-foreground h-7 gap-1 px-2"
                  >
                    <MessageCircle className="h-3 w-3" />
                    {showReplies ? "Hide" : "Show"} {comment.repliesCount}{" "}
                    replies
                  </Button>
                )}

                {/* More Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-7 w-7 p-0"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {comment.canEdit && (
                      <DropdownMenuItem onClick={() => startEdit(comment)}>
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {comment.canDelete && (
                      <DropdownMenuItem
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </DropdownMenuItem>
                    )}
                    {!comment.canEdit && !comment.canDelete && (
                      <DropdownMenuItem
                        onClick={() => onReportComment(comment.id)}
                      >
                        <Flag className="mr-2 h-3 w-3" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Reply Form */}
            {isReplying && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px] resize-none"
                  placeholder={`Reply to @${comment.user.username}...`}
                  maxLength={500}
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={submitting || !replyContent.trim()}
                  >
                    {submitting ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : null}
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelReply}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && showReplies && (
          <div className="space-y-3">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* New Comment Form */}
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={currentUser.profileImageUrl ?? undefined} />
          <AvatarFallback className="text-xs">
            {currentUser.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            ref={textareaRef}
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px] resize-none"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {500 - newCommentContent.length} characters remaining
            </span>
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={submitting || !newCommentContent.trim()}
            >
              {submitting ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Send className="mr-1 h-3 w-3" />
              )}
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center">
          <MessageCircle className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
          <p className="text-muted-foreground text-sm">No comments yet</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}
