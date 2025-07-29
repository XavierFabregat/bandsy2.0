"use client";

import { useState } from "react";
import { PostComposer } from "@/components/posts";
import { createPost } from "@/app/actions/posts";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { type UploadedAttachment } from "@/hooks/use-post-media-upload";

interface PostCreationSectionProps {
  currentUser: {
    id: string;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
    isPremium: boolean;
  };
}

interface PostData {
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
}

export function PostCreationSection({ currentUser }: PostCreationSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (postData: PostData) => {
    setIsSubmitting(true);
    try {
      await createPost(postData);
      toast.success("Post created successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create post",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-6 w-2 rounded-full bg-gradient-to-b from-cyan-500 to-blue-500" />
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <FileText className="h-6 w-6" />
          Share Something
        </h2>
      </div>
      <PostComposer
        currentUser={currentUser}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        placeholder="Share your musical journey, thoughts, or connect with the community..."
      />
    </div>
  );
}
