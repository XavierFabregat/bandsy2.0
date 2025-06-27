"use client";

import { Edit, Trash2, Music, Eye, EyeOff } from "lucide-react";
import AudioPlayer from "./audio-player";
import type { Genre, Instrument } from "@/types/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Sample } from "@/types/api";

interface SampleProps {
  sample: Sample;
}

export default function Sample({ sample }: SampleProps) {
  const router = useRouter();
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleDelete = async () => {
    const result = await fetch(`/api/sample/delete?sampleId=${sample.id}`, {
      method: "DELETE",
    }).then((res) => res.json() as Promise<{ success: boolean }>);
    if (result.success) {
      toast.success("Sample deleted");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 md:flex-row">
      {/* File Icon */}
      <div className="flex-shrink-0">
        <Music className="h-10 w-10 text-blue-500" />
      </div>

      {/* Sample Content */}
      <div className="w-full min-w-0 flex-1">
        {/* Title, Duration, and Visibility Status */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-lg font-medium">{sample.title}</span>
          <span className="text-muted-foreground text-xs">
            {formatDuration(sample.duration)}
          </span>
          {/* Public/Private Status Badge */}
          <Badge
            variant={sample.isPublic ? "default" : "secondary"}
            className={`ml-auto flex items-center gap-1 text-xs ${
              sample.isPublic
                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"
                : "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-200"
            }`}
          >
            {sample.isPublic ? (
              <>
                <Eye className="h-3 w-3" />
                Public
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3" />
                Private
              </>
            )}
          </Badge>
        </div>

        {/* Description */}
        {sample.description && (
          <div className="text-muted-foreground truncate text-sm">
            {sample.description}
          </div>
        )}

        {/* Genres */}
        <div className="border-muted my-2 flex flex-wrap justify-center gap-2 border-t border-b py-2">
          {sample.genres?.map((genre) => (
            <Badge key={genre.id} variant="outline">
              {genre.name}
            </Badge>
          ))}
        </div>

        {/* Audio Player */}
        <div className="mt-4">
          <AudioPlayer
            src={sample.fileUrl}
            title={sample.title}
            className="w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 sm:flex-col sm:justify-end sm:self-stretch">
        <Link
          href={`/samples/edit/${sample.id}`}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
        >
          <Edit className="mr-1 h-4 w-4" /> Edit
        </Link>
        <AlertDialog>
          <AlertDialogTrigger className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium">
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Sample</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                sample and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
