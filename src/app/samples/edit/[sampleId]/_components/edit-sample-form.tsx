"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  ArrowLeft,
  Music,
  Clock,
  FileAudio,
  Loader2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import AudioPlayer from "@/app/samples/_components/audio-player";
import type { UpdateSampleMetadata } from "@/server/mutations";
import type { Genre, Instrument, Sample } from "@/types/api";

interface EditSampleFormProps {
  sample: Sample;
  instruments: Instrument[];
  genres: Genre[];
}

export function EditSampleForm({
  sample,
  instruments,
  genres,
}: EditSampleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [expandedGenres, setExpandedGenres] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: sample.title,
    description: sample.description ?? "",
    instrumentId: sample.instrument?.id ?? "",
    genreIds: sample.genres?.map((g) => g.id) ?? [],
    isPublic: sample.isPublic,
  });

  // Organize genres into parent/child structure
  const organizedGenres = genres.reduce((acc, genre) => {
    if (!genre.parentGenreId) {
      // This is a parent genre
      acc.push({
        ...genre,
        subGenres: genres.filter((g) => g.parentGenreId === genre.id),
      });
    }
    return acc;
  }, [] as Genre[]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (url: string) => {
    // This is a placeholder - in a real app you'd get this from metadata
    return "~2.5 MB";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const metadata: UpdateSampleMetadata = {
        title: formData.title,
        description: formData.description,
        instrumentId: formData.instrumentId,
        genreIds: formData.genreIds,
        duration: sample.duration ?? 0,
        isPublic: formData.isPublic,
      };

      const response = await fetch("/api/sample/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleId: sample.id,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sample");
      }

      toast.success("Sample updated successfully!");
      router.push("/samples");
      router.refresh();
    } catch (error) {
      console.error("Error updating sample:", error);
      toast.error("Failed to update sample");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreToggle = (genreId: string) => {
    setFormData((prev) => ({
      ...prev,
      genreIds: prev.genreIds.includes(genreId)
        ? prev.genreIds.filter((id) => id !== genreId)
        : [...prev.genreIds, genreId],
    }));
  };

  const toggleGenreExpansion = (genreId: string) => {
    setExpandedGenres((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(genreId)) {
        newSet.delete(genreId);
      } else {
        newSet.add(genreId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    console.log(formData.isPublic);
  }, [formData.isPublic]);

  const handleParentGenreSelect = (parentGenre: Genre) => {
    // If parent genre is selected, select all subgenres
    const subGenreIds = parentGenre.subGenres?.map((sg) => sg.id) ?? [];
    const allIds = [parentGenre.id, ...subGenreIds];

    const isOnlyParentSelected =
      formData.genreIds.includes(parentGenre.id) &&
      !formData.genreIds.some((id) => subGenreIds.includes(id));
    const areNoneSelected = !formData.genreIds.some((id) =>
      allIds.includes(id),
    );

    if (isOnlyParentSelected) {
      // deselect the parent genre
      setFormData((prev) => ({
        ...prev,
        genreIds: prev.genreIds.filter((id) => id !== parentGenre.id),
      }));
    } else if (areNoneSelected) {
      // Select only the parent genre
      setFormData((prev) => ({
        ...prev,
        genreIds: [...new Set([...prev.genreIds, parentGenre.id])],
      }));
    } else {
      // Deselect all
      setFormData((prev) => ({
        ...prev,
        genreIds: prev.genreIds.filter((id) => !allIds.includes(id)),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/samples" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Samples
          </Link>
        </Button>
      </div>

      {/* Sample Preview Card */}
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="text-primary h-5 w-5" />
            Sample Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Info */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(sample.duration)}
            </div>
            <div className="flex items-center gap-1">
              <FileAudio className="h-4 w-4" />
              {sample.fileType.toUpperCase()}
            </div>
            <div>{formatFileSize(sample.fileUrl)}</div>
          </div>

          {/* Audio Player */}
          <AudioPlayer
            src={sample.fileUrl}
            title={sample.title}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="text-primary h-5 w-5" />
            Sample Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title *
              </label>
              <input
                id="title"
                type="text"
                required
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter sample title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your sample..."
              />
            </div>

            {/* Instrument */}
            <div className="space-y-2">
              <label htmlFor="instrument" className="text-sm font-medium">
                Primary Instrument *
              </label>
              <select
                id="instrument"
                required
                className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={formData.instrumentId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instrumentId: e.target.value,
                  }))
                }
              >
                <option value="">Select an instrument</option>
                {instruments.map((instrument) => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.name} ({instrument.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Public/Private Toggle */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Visibility</label>
              <div className="border-input bg-background flex items-center gap-4 rounded-md border p-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isPublic: !prev.isPublic,
                    }))
                  }
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    formData.isPublic
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {formData.isPublic ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Public
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Private
                    </>
                  )}
                </button>
                <div className="flex-1">
                  <p className="text-sm">
                    {formData.isPublic
                      ? "This sample is visible to other users and can be discovered in browse"
                      : "This sample is private and only visible to you"}
                  </p>
                </div>
              </div>
            </div>

            {/* Hierarchical Genres */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Genres (select all that apply)
              </label>

              <div className="bg-muted/20 max-h-96 space-y-3 overflow-y-auto rounded-md border p-3">
                {organizedGenres.map((parentGenre) => (
                  <div key={parentGenre.id} className="space-y-2">
                    {/* Parent Genre */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleGenreExpansion(parentGenre.id)}
                        className="hover:bg-muted rounded-sm p-1 transition-colors"
                      >
                        {expandedGenres.has(parentGenre.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>

                      <Badge
                        variant={
                          formData.genreIds.includes(parentGenre.id)
                            ? "default"
                            : "outline"
                        }
                        className="hover:bg-primary/20 cursor-pointer font-semibold transition-colors"
                        onClick={() => handleParentGenreSelect(parentGenre)}
                      >
                        {parentGenre.name}
                        {parentGenre.subGenres &&
                          parentGenre.subGenres.length > 0 && (
                            <span className="ml-1 text-xs opacity-70">
                              (
                              {
                                parentGenre.subGenres.filter((sg) =>
                                  formData.genreIds.includes(sg.id),
                                ).length
                              }
                              /{parentGenre.subGenres.length})
                            </span>
                          )}
                      </Badge>
                    </div>

                    {/* Subgenres */}
                    {expandedGenres.has(parentGenre.id) &&
                      parentGenre.subGenres && (
                        <div className="ml-8 flex flex-wrap gap-2">
                          {parentGenre.subGenres.map((subGenre) => (
                            <Badge
                              key={subGenre.id}
                              variant={
                                formData.genreIds.includes(subGenre.id)
                                  ? "default"
                                  : "secondary"
                              }
                              className="hover:bg-primary/20 cursor-pointer text-xs transition-colors"
                              onClick={() => handleGenreToggle(subGenre.id)}
                            >
                              {subGenre.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {/* Selected Genres Summary */}
              {formData.genreIds.length > 0 && (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs font-medium">
                    Selected genres ({formData.genreIds.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {formData.genreIds.map((genreId) => {
                      const genre = genres.find((g) => g.id === genreId);
                      return genre ? (
                        <Badge
                          key={genreId}
                          variant="default"
                          className="text-xs"
                        >
                          {genre.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {formData.genreIds.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  Select at least one genre to help others discover your sample
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={
                  isLoading || !formData.title.trim() || !formData.instrumentId
                }
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Sample
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/samples">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
