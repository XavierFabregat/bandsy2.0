"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2, Video, Music } from "lucide-react";
import type { Genre, Instrument } from "@/types/api";

interface Sample {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  duration: number | null;
  instrument: Instrument | null;
  genres: Genre[] | null;
  createdAt: Date;
  metadata: unknown;
}

interface SampleProps {
  sample: Sample;
}

export default function Sample({ sample }: SampleProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleEdit = () => {
    // onEdit?.(sample.id);
  };

  const handleDelete = () => {
    // onDelete?.(sample.id);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 md:flex-row">
      {/* File Icon */}
      <div className="flex-shrink-0">
        {sample.fileType === "audio" ? (
          <Music className="h-10 w-10 text-blue-500" />
        ) : (
          <Video className="h-10 w-10 text-purple-500" />
        )}
      </div>

      {/* Sample Content */}
      <div className="min-w-0 flex-1">
        {/* Title and Duration */}
        <div className="flex items-center gap-2">
          <span className="truncate text-lg font-medium">{sample.title}</span>
          <span className="text-muted-foreground text-xs">
            {formatDuration(sample.duration)}
          </span>
        </div>

        {/* Description */}
        {sample.description && (
          <div className="text-muted-foreground truncate text-sm">
            {sample.description}
          </div>
        )}

        {/* Media Player */}
        <div className="mt-2">
          {sample.fileType === "audio" ? (
            <audio controls src={sample.fileUrl} className="w-full max-w-xs" />
          ) : (
            <video
              controls
              src={sample.fileUrl}
              className="w-full max-w-xs rounded-lg"
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="sm" onClick={handleEdit}>
          <Edit className="mr-1 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-1 h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
}
