"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  Image,
  Video,
  Disc,
  File,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import {
  usePostMediaUpload,
  type UploadedAttachment,
} from "@/hooks/use-post-media-upload";
interface MediaFile {
  id: string;
  file: File;
  type: "image" | "video" | "audio" | "document";
  preview?: string;
  uploadProgress?: number;
  error: string | null;
  uploaded?: boolean;
  attachmentId?: string;
  fileUrl?: string;
}

interface MediaUploadProps {
  onFilesChange: (files: UploadedAttachment[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
];

const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 50 * 1024 * 1024, // 50MB
  document: 10 * 1024 * 1024, // 10MB
};

export function MediaUpload({
  onFilesChange,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFiles = 10,
  disabled = false,
  className,
}: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<
    UploadedAttachment[]
  >([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFiles, uploading } = usePostMediaUpload();

  const getFileType = (
    file: File,
  ): "image" | "video" | "audio" | "document" => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "document";
  };

  const getFileIcon = (type: "image" | "video" | "audio" | "document") => {
    switch (type) {
      case "image":
        // eslint-disable-next-line jsx-a11y/alt-text -- reason: its not an image but an icon called image
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Disc className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `File type ${file.type} is not supported`;
      }

      const fileType = getFileType(file);
      const maxSize = MAX_FILE_SIZES[fileType];

      if (file.size > maxSize) {
        return `File is too large. Maximum size for ${fileType} files is ${Math.round(maxSize / (1024 * 1024))}MB`;
      }

      return null;
    },
    [acceptedTypes],
  );

  const createPreview = useCallback(
    async (file: File): Promise<string | undefined> => {
      if (file.type.startsWith("image/")) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }
      return undefined;
    },
    [],
  );

  const processFiles = useCallback(
    async (fileList: File[]) => {
      if (disabled || uploadedAttachments.length >= maxFiles) return;

      const remainingSlots = maxFiles - uploadedAttachments.length;
      const filesToProcess = fileList.slice(0, remainingSlots);

      // Validate files first
      const validFiles: File[] = [];
      const invalidFiles: MediaFile[] = [];

      for (const file of filesToProcess) {
        const error = validateFile(file);
        const type = getFileType(file);
        const preview = await createPreview(file);

        if (error) {
          invalidFiles.push({
            id: `${Date.now()}-${Math.random()}`,
            file,
            type,
            preview,
            error,
            uploaded: false,
          });
        } else {
          validFiles.push(file);
        }
      }

      // Show invalid files temporarily
      if (invalidFiles.length > 0) {
        setFiles((prev) => [...prev, ...invalidFiles]);
        // Remove invalid files after 3 seconds
        setTimeout(() => {
          setFiles((prev) =>
            prev.filter(
              (f) => !invalidFiles.find((invalid) => invalid.id === f.id),
            ),
          );
        }, 3000);
      }

      // Upload valid files
      console.log("validFiles", validFiles);
      if (validFiles.length > 0) {
        try {
          const attachments = await uploadFiles(validFiles);
          console.log("attachments", attachments);
          const newUploadedAttachments = [
            ...uploadedAttachments,
            ...attachments,
          ];
          setUploadedAttachments(newUploadedAttachments);
          onFilesChange(newUploadedAttachments);
        } catch (error) {
          console.error("Upload failed:", error);
        }
      }
    },
    [
      uploadedAttachments,
      maxFiles,
      disabled,
      onFilesChange,
      validateFile,
      createPreview,
      uploadFiles,
    ],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      void processFiles(droppedFiles);
    },
    [disabled, processFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files ?? []);
      void processFiles(selectedFiles);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      // Remove from temporary invalid files
      const updatedFiles = files.filter((f) => f.id !== fileId);
      setFiles(updatedFiles);

      // Remove from uploaded attachments
      const updatedAttachments = uploadedAttachments.filter(
        (f) => f.id !== fileId,
      );
      setUploadedAttachments(updatedAttachments);
      onFilesChange(updatedAttachments);
    },
    [files, uploadedAttachments, onFilesChange],
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "cursor-pointer border-2 border-dashed transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          disabled && "cursor-not-allowed opacity-50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <Upload
              className={cn(
                "h-8 w-8 transition-colors",
                isDragOver ? "text-primary" : "text-muted-foreground",
              )}
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isDragOver ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="text-muted-foreground text-xs">
                or click to browse • {maxFiles - uploadedAttachments.length}{" "}
                files remaining
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {acceptedTypes.includes("image/jpeg") && (
                <Badge variant="secondary" className="text-xs">
                  Images
                </Badge>
              )}
              {acceptedTypes.includes("video/mp4") && (
                <Badge variant="secondary" className="text-xs">
                  Videos
                </Badge>
              )}
              {acceptedTypes.includes("audio/mp3") && (
                <Badge variant="secondary" className="text-xs">
                  Audio
                </Badge>
              )}
            </div>
            {uploading && (
              <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                Uploading files...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {(files.length > 0 || uploadedAttachments.length > 0) && (
        <div className="space-y-2">
          {/* Temporary invalid files */}
          {files.map((mediaFile) => (
            <Card key={mediaFile.id} className="p-3">
              <div className="flex items-center gap-3">
                {/* Preview/Icon */}
                <div className="flex-shrink-0">
                  {mediaFile.preview ? (
                    <NextImage
                      src={mediaFile.preview}
                      alt={mediaFile.file.name}
                      className="h-10 w-10 rounded object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                      {getFileIcon(mediaFile.type)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {mediaFile.file.name}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {mediaFile.type}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(mediaFile.file.size)}
                    </p>
                    {mediaFile.error && (
                      <div className="text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">{mediaFile.error}</span>
                      </div>
                    )}
                    {mediaFile.uploaded && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs">Uploaded</span>
                      </div>
                    )}
                  </div>
                  {mediaFile.uploadProgress !== undefined && (
                    <Progress
                      value={mediaFile.uploadProgress}
                      className="mt-2 h-1"
                    />
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(mediaFile.id);
                  }}
                  className="h-8 w-8 flex-shrink-0 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {/* Successfully uploaded attachments */}
          {uploadedAttachments.map((attachment) => (
            <Card key={attachment.id} className="p-3">
              <div className="flex items-center gap-3">
                {/* Preview/Icon */}
                <div className="flex-shrink-0">
                  {attachment.preview ? (
                    <NextImage
                      src={attachment.preview}
                      alt={attachment.filename}
                      className="h-10 w-10 rounded object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                      {getFileIcon(attachment.fileType)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {attachment.filename}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {attachment.fileType}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-xs">Uploaded</span>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(attachment.id);
                  }}
                  className="h-8 w-8 flex-shrink-0 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
