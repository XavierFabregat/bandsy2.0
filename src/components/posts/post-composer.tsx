"use client";

import { useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Disc,
  AtSign,
  MapPin,
  Smile,
  Users,
  User,
  Globe,
  Lock,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MediaUpload } from "./media-upload";
import { type UploadedAttachment } from "@/hooks/use-post-media-upload";

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
  onSubmit: (postData: {
    content: string;
    type:
      | "text"
      | "image"
      | "video"
      | "audio"
      | "link"
      | "media_sample"
      | "mixed";
    authorType: "user" | "group";
    authorId: string;
    visibility: "public" | "followers_only" | "group_members_only" | "private";
    mediaSampleId?: string;
    attachments?: UploadedAttachment[];
    mentions?: Array<{
      type: "user" | "group";
      id: string;
      start: number;
      end: number;
    }>;
  }) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function PostComposer({
  currentUser,
  userGroups = [],
  onSubmit,
  isLoading = false,
  placeholder = "What's on your mind?",
  disabled = false,
  className,
}: PostComposerProps) {
  const [content, setContent] = useState("");
  const [authorType, setAuthorType] = useState<"user" | "group">("user");
  const [authorId, setAuthorId] = useState(currentUser.id);
  const [visibility, setVisibility] = useState<
    "public" | "followers_only" | "group_members_only" | "private"
  >("public");
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [mediaSampleId, setMediaSampleId] = useState<string>();
  const [mentions, setMentions] = useState<
    Array<{ type: "user" | "group"; id: string; start: number; end: number }>
  >([]);
  const [showMentions, setShowMentions] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterLimit = currentUser.isPremium ? 2000 : 500;
  const charactersUsed = content.length;
  const charactersRemaining = characterLimit - charactersUsed;

  const getAuthorInfo = useCallback(() => {
    if (authorType === "user") {
      return {
        name: currentUser.displayName ?? currentUser.username,
        imageUrl: currentUser.profileImageUrl,
        handle: `@${currentUser.username}`,
      };
    } else {
      const group = userGroups.find((g) => g.id === authorId);
      return {
        name: group?.name ?? "Unknown Group",
        imageUrl: group?.imageUrl,
        handle: `@${group?.handle}`,
      };
    }
  }, [authorType, authorId, currentUser, userGroups]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= characterLimit) {
      setContent(newContent);
    }

    // Check for @ mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newContent.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (/^[a-zA-Z0-9_]*$/.exec(textAfterAt)) {
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleFilesChange = (uploadedFiles: UploadedAttachment[]) => {
    setAttachments(uploadedFiles);
  };

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return;

    const postType =
      attachments.length > 0
        ? attachments.length === 1
          ? attachments[0]?.fileType === "image"
            ? "image"
            : attachments[0]?.fileType === "video"
              ? "video"
              : "mixed"
          : "mixed"
        : mediaSampleId
          ? "media_sample"
          : "text";

    await onSubmit({
      content: content.trim(),
      type: postType,
      authorType,
      authorId,
      visibility,
      mediaSampleId,
      attachments,
      mentions,
    });

    // Reset form
    setContent("");
    setAttachments([]);
    setMediaSampleId(undefined);
    setMentions([]);
    setShowMentions(false);
  };

  const authorInfo = getAuthorInfo();
  const adminGroups = userGroups.filter((g) => g.role === "admin");

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={authorInfo.imageUrl ?? undefined} />
              <AvatarFallback>
                {authorInfo.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{authorInfo.name}</span>
                {userGroups.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        {authorType === "user" ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Users className="h-3 w-3" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setAuthorType("user");
                          setAuthorId(currentUser.id);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Post as{" "}
                        {currentUser.displayName ?? currentUser.username}
                      </DropdownMenuItem>
                      {adminGroups.map((group) => (
                        <DropdownMenuItem
                          key={group.id}
                          onClick={() => {
                            setAuthorType("group");
                            setAuthorId(group.id);
                          }}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Post as {group.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                {authorInfo.handle}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {visibility === "public" && <Globe className="h-4 w-4" />}
                {visibility === "followers_only" && (
                  <UserCheck className="h-4 w-4" />
                )}
                {visibility === "private" && <Lock className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setVisibility("public")}>
                <Globe className="mr-2 h-4 w-4" />
                Public
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVisibility("followers_only")}>
                <UserCheck className="mr-2 h-4 w-4" />
                Followers Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVisibility("private")}>
                <Lock className="mr-2 h-4 w-4" />
                Private
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="min-h-[120px] resize-none border-0 p-0 text-lg focus-visible:ring-0"
            maxLength={characterLimit}
          />
          {showMentions && (
            <div className="bg-background absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border shadow-lg">
              {/* Mention suggestions would go here */}
              <div className="text-muted-foreground p-2 text-sm">
                Type to search for users and groups...
              </div>
            </div>
          )}
        </div>

        {/* Media Upload */}
        <MediaUpload
          onFilesChange={handleFilesChange}
          maxFiles={10}
          disabled={disabled || isLoading}
        />

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" disabled={disabled || isLoading}>
              <Disc className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={disabled || isLoading}>
              <AtSign className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={disabled || isLoading}>
              <MapPin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={disabled || isLoading}>
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm",
                  charactersRemaining < 50
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {charactersRemaining}
              </span>
              {currentUser.isPremium && (
                <Badge variant="secondary" className="text-xs">
                  Premium
                </Badge>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={
                disabled ||
                isLoading ||
                (!content.trim() && attachments.length === 0)
              }
              size="sm"
            >
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
