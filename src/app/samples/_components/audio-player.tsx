"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

export default function AudioPlayer({
  src,
  title,
  className = "",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedData = () => setIsLoading(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadeddata", handleLoadedData);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [isSeeking]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const percentage = value[0] ?? 0;
    const newTime = (percentage / 100) * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = (value: number[]) => {
    setIsSeeking(false);
    handleSeek(value);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = (value[0] ?? 0) / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-muted rounded-lg p-4 ${className}`}>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title */}
      {title && (
        <div className="mb-3">
          <h4 className="truncate text-sm font-medium">{title}</h4>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="relative">
          <Slider
            value={[progressPercentage]}
            onValueChange={handleSeek}
            onValueCommit={handleSeekEnd}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="text-muted-foreground mt-1 flex justify-between text-xs">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Skip Backward */}
          <Button
            variant="ghost"
            size="sm"
            onClick={skipBackward}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          {/* Play/Pause */}
          <Button
            variant="default"
            size="sm"
            onClick={togglePlay}
            disabled={isLoading}
            className="h-10 w-10 rounded-full p-0"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" />
            )}
          </Button>

          {/* Skip Forward */}
          <Button
            variant="ghost"
            size="sm"
            onClick={skipForward}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <div className="w-20">
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
