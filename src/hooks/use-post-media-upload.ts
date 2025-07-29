"use client";

import { useState, useCallback } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";

export interface UploadedAttachment {
  id: string;
  attachmentId: string;
  fileUrl: string;
  fileType: "image" | "video" | "audio" | "document";
  filename: string;
  fileSize: number;
  preview?: string;
  uploaded: boolean;
  error?: string;
}

export function usePostMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress] = useState<Record<string, number>>({});

  const { startUpload, isUploading } = useUploadThing("postMediaUploader", {
    onClientUploadComplete: (files) => {
      console.log("Upload completed:", files);
      toast.success(`Successfully uploaded ${files.length} file(s)`);
      setUploading(false);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
    },
    onUploadProgress: (progress) => {
      // UploadThing provides progress for all files
      console.log("Upload progress:", progress);
      // For now, just log the progress - will implement proper progress tracking later
    },
  });

  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadedAttachment[]> => {
      if (!files.length) return [];

      setUploading(true);

      try {
        const uploadedFiles = await startUpload(files);

        if (!uploadedFiles) {
          throw new Error("Upload failed - no files returned");
        }

        // Transform the response to match our MediaFile interface
        const attachments: UploadedAttachment[] = uploadedFiles.map((file) => ({
          id: file.serverData.attachmentId,
          attachmentId: file.serverData.attachmentId,
          fileUrl: file.serverData.fileUrl,
          fileType: file.serverData.fileType,
          filename: file.serverData.filename,
          fileSize: file.serverData.fileSize,
          preview:
            file.serverData.fileType === "image"
              ? file.serverData.fileUrl
              : undefined,
          uploaded: true,
          error: undefined,
        }));

        return attachments;
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        toast.error(errorMessage);
        return [];
      } finally {
        setUploading(false);
      }
    },
    [startUpload],
  );

  return {
    uploadFiles,
    uploading: uploading || isUploading,
    uploadProgress,
  };
}
