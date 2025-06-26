"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function PencilUTButton() {
  const router = useRouter();
  const { startUpload, isUploading } = useUploadThing("avatarUploader", {
    onClientUploadComplete: () => {
      router.refresh();
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
    },
  });

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const files = Array.from(target.files ?? []);
      if (files.length > 0) {
        await startUpload(files);
      }
    };
    input.click();
  }, [startUpload]);

  return (
    <button
      onClick={handleClick}
      disabled={isUploading}
      className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-colors disabled:opacity-50"
      title="Upload image"
    >
      {isUploading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Pencil className="h-4 w-4" />
      )}
    </button>
  );
}
