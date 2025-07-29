"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Disc,
  Play,
  Pause,
  Search,
  Music,
  Clock,
  User,
  X,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioSample {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
  };
  genre?: {
    id: string;
    name: string;
  };
  instrument?: {
    id: string;
    name: string;
  };
  bpm?: number;
  key?: string;
}

interface AudioSampleSelectorProps {
  onSampleSelect: (sample: AudioSample) => void;
  onSampleRemove: () => void;
  selectedSample?: AudioSample | null;
  userSamples?: AudioSample[];
  disabled?: boolean;
  className?: string;
}

export function AudioSampleSelector({
  onSampleSelect,
  onSampleRemove,
  selectedSample,
  userSamples = [],
  disabled = false,
  className,
}: AudioSampleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>(
    {},
  );
  const [filteredSamples, setFilteredSamples] =
    useState<AudioSample[]>(userSamples);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    const filtered = userSamples.filter(
      (sample) =>
        sample.title.toLowerCase().includes(searchQuery.toLowerCase()) ??
        sample.user.username
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ??
        sample.genre?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        sample.instrument?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
    setFilteredSamples(filtered);
  }, [searchQuery, userSamples]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = (sampleId: string, audioUrl: string) => {
    // Stop any currently playing audio
    Object.values(audioRefs.current).forEach((audio) => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    if (currentlyPlaying === sampleId) {
      setCurrentlyPlaying(null);
      return;
    }

    // Create or get audio element
    if (!audioRefs.current[sampleId]) {
      const audio = new Audio(audioUrl);
      audio.addEventListener("timeupdate", () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        setAudioProgress((prev) => ({ ...prev, [sampleId]: progress }));
      });
      audio.addEventListener("ended", () => {
        setCurrentlyPlaying(null);
        setAudioProgress((prev) => ({ ...prev, [sampleId]: 0 }));
      });
      audioRefs.current[sampleId] = audio;
    }

    const audio = audioRefs.current[sampleId];
    void audio.play();
    setCurrentlyPlaying(sampleId);
  };

  const handleSampleSelect = (sample: AudioSample) => {
    onSampleSelect(sample);
    setIsOpen(false);
    // Stop any playing audio
    if (currentlyPlaying) {
      audioRefs.current[currentlyPlaying]?.pause();
      setCurrentlyPlaying(null);
    }
  };

  const handleRemoveSelected = () => {
    onSampleRemove();
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  if (selectedSample) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                <Music className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-medium">{selectedSample.title}</h4>
                <Badge variant="outline" className="text-xs">
                  <Disc className="mr-1 h-3 w-3" />
                  Sample
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={selectedSample.user.profileImageUrl ?? undefined}
                  />
                  <AvatarFallback className="text-xs">
                    {selectedSample.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground text-sm">
                  @{selectedSample.user.username}
                </span>
                <span className="text-muted-foreground text-sm">
                  {formatDuration(selectedSample.duration)}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveSelected}
              className="h-8 w-8 flex-shrink-0 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-start gap-2", className)}
        >
          <Disc className="h-4 w-4" />
          Add Audio Sample
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Audio Sample</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search your samples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sample List */}
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {filteredSamples.length === 0 ? (
              <div className="py-8 text-center">
                <Music className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  {searchQuery
                    ? "No samples found matching your search"
                    : "No audio samples found"}
                </p>
              </div>
            ) : (
              filteredSamples.map((sample) => {
                const isPlaying = currentlyPlaying === sample.id;
                const progress = audioProgress[sample.id] ?? 0;

                return (
                  <Card
                    key={sample.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleSampleSelect(sample)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Play Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPause(sample.id, sample.audioUrl);
                          }}
                          className="h-10 w-10 flex-shrink-0 p-0"
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Sample Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="truncate font-medium">
                              {sample.title}
                            </h4>
                            {sample.genre && (
                              <Badge variant="secondary" className="text-xs">
                                {sample.genre.name}
                              </Badge>
                            )}
                            {sample.instrument && (
                              <Badge variant="outline" className="text-xs">
                                {sample.instrument.name}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage
                                src={sample.user.profileImageUrl ?? undefined}
                              />
                              <AvatarFallback className="text-xs">
                                {sample.user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground text-sm">
                              @{sample.user.username}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {formatDuration(sample.duration)}
                            </span>
                            {sample.bpm && (
                              <span className="text-muted-foreground text-xs">
                                {sample.bpm} BPM
                              </span>
                            )}
                            {sample.key && (
                              <span className="text-muted-foreground text-xs">
                                {sample.key}
                              </span>
                            )}
                          </div>
                          {/* Progress Bar */}
                          {isPlaying && (
                            <div className="mt-2">
                              <div className="bg-muted h-1 w-full rounded-full">
                                <div
                                  className="bg-primary h-1 rounded-full transition-all duration-100"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Volume Icon */}
                        <Volume2 className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
