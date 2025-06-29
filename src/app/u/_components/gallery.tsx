"use client";

import { useState } from "react";
import { Music, Clock, Grid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/app/samples/_components/audio-player";
import type { Sample, UserProfile } from "@/types/api";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface GalleryProps {
  samples: Sample[];
  user: UserProfile;
}

type ViewMode = "grid" | "list";
type FilterBy = "all" | "instrument" | "genre";

export default function Gallery({ samples, user }: GalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  // const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Get unique instruments and genres for filtering
  const instruments = Array.from(
    new Set(samples.map((s) => s.instrument?.name).filter(Boolean)),
  );
  const genres = Array.from(
    new Set(samples.flatMap((s) => s.genres?.map((g) => g.name) ?? [])),
  );

  // Filter samples based on current filter
  const filteredSamples = samples.filter((sample) => {
    if (selectedFilter === "all") return true;

    if (filterBy === "instrument") {
      return sample.instrument?.name === selectedFilter;
    }

    if (filterBy === "genre") {
      return sample.genres?.some((g) => g.name === selectedFilter);
    }

    return true;
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleFilterChange = (type: FilterBy, value: string) => {
    setFilterBy(type);
    setSelectedFilter(value);
  };

  const SampleCard = ({ sample }: { sample: Sample }) => (
    <div className="group bg-card hover:shadow-primary/10 relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg leading-tight font-semibold">
              {sample.title}
            </h3>
            {sample.description && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                {sample.description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <Music className="text-primary h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="px-4 pb-2">
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(sample.duration)}
          </div>
          <div className="truncate">{sample.fileType.toUpperCase()}</div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-1">
          {sample.instrument && (
            <Badge variant="secondary" className="text-xs">
              {sample.instrument.name}
            </Badge>
          )}
          {sample.genres?.slice(0, 2).map((genre) => (
            <Badge key={genre.id} variant="outline" className="text-xs">
              {genre.name}
            </Badge>
          ))}
          {sample.genres && sample.genres.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{sample.genres.length - 2}
            </Badge>
          )}
        </div>
      </div>

      {/* Audio Player */}
      <div className="border-t p-4 pt-2">
        <AudioPlayer
          src={sample.fileUrl}
          title={sample.title}
          className="w-full"
        />
      </div>
    </div>
  );

  const SampleListItem = ({ sample }: { sample: Sample }) => (
    <div className="group bg-card flex min-w-[500px] items-center gap-4 rounded-lg border p-4 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Icon */}
      <div className="flex-shrink-0">
        <Music className="text-primary h-8 w-8" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{sample.title}</h3>
            {sample.description && (
              <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                {sample.description}
              </p>
            )}

            <div className="mt-2 flex items-center gap-2">
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {formatDuration(sample.duration)}
              </span>
              {sample.instrument && (
                <Badge variant="secondary" className="text-xs">
                  {sample.instrument.name}
                </Badge>
              )}
              {sample.genres
                ?.filter((g) => {
                  console.log(isMobile);
                  if (isMobile) return g.parentGenreId === null;
                  return true;
                })
                .slice(0, 3)
                .map((genre) => (
                  <Badge key={genre.id} variant="outline" className="text-xs">
                    {genre.name}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Audio Player */}
          <div className="w-full flex-1 flex-shrink-0 sm:w-1/2">
            <AudioPlayer
              src={sample.fileUrl}
              title={sample.title}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {user.displayName}&apos;s Samples
            </h2>
            <p className="text-muted-foreground">
              {filteredSamples.length} of {samples.length} samples
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        {(instruments.length > 0 || genres.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("all", "all")}
            >
              All
            </Button>

            {instruments.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Instruments:
                </span>
                {instruments.map((instrument) => (
                  <Button
                    key={instrument}
                    variant={
                      filterBy === "instrument" && selectedFilter === instrument
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleFilterChange("instrument", instrument ?? "")
                    }
                  >
                    {instrument}
                  </Button>
                ))}
              </div>
            )}

            {genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm">Genres:</span>
                {genres.slice(0, 5).map((genre) => (
                  <Button
                    key={genre}
                    variant={
                      filterBy === "genre" && selectedFilter === genre
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleFilterChange("genre", genre ?? "")}
                  >
                    {genre}
                  </Button>
                ))}
                {genres.length > 5 && (
                  <span className="text-muted-foreground text-xs">
                    +{genres.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredSamples.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Music className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">
            {selectedFilter === "all" ? "No samples yet" : "No samples found"}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {selectedFilter === "all"
              ? `${user.displayName} hasn't uploaded any samples yet.`
              : "Try adjusting your filters to see more samples."}
          </p>
        </div>
      )}

      {/* Gallery Grid/List */}
      {filteredSamples.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {filteredSamples.map((sample) =>
            viewMode === "grid" ? (
              <SampleCard key={sample.id} sample={sample} />
            ) : (
              <SampleListItem key={sample.id} sample={sample} />
            ),
          )}
        </div>
      )}

      {/* Load More Button (for future pagination) */}
      {filteredSamples.length > 0 && samples.length > 12 && (
        <div className="flex justify-center pt-6">
          <Button variant="outline" size="lg">
            Load More Samples
          </Button>
        </div>
      )}
    </div>
  );
}
