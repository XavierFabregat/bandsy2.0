"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  X,
  Star,
  Eye,
  MapPin,
  Calendar,
  Music,
  Play,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import type { MatchCandidate } from "@/lib/matching/types/matching-types";
import Link from "next/link";
import AudioPlayer from "../../samples/_components/audio-player";

interface CandidateCardProps {
  candidate: MatchCandidate;
  onInteraction: (action: "like" | "pass" | "super_like") => void;
}

export function CandidateCard({
  candidate,
  onInteraction,
}: CandidateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-amber-600 dark:text-amber-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80)
      return "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800";
    if (score >= 60)
      return "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800";
    if (score >= 40)
      return "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800";
    return "bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Great Match";
    if (score >= 40) return "Good Match";
    return "Potential Match";
  };

  const formatLastActive = (date: Date) => {
    date = new Date(date);
    console.log("date ==>", date);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Active now";
    if (diffInHours < 24) return `Active ${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Active ${diffInDays}d ago`;
    return "Active recently";
  };

  console.log("candidate ==>", candidate);

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-white via-white to-gray-50/30 shadow-xl dark:from-gray-950 dark:via-gray-950 dark:to-gray-900/50">
      {/* Header with gradient background */}
      <div className="from-primary/10 via-primary/5 relative border-b border-gray-100 bg-gradient-to-r to-transparent p-6 dark:border-gray-800">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 shadow-lg ring-4 ring-white dark:ring-gray-800">
                <AvatarImage
                  src={candidate.user.profileImageUrl ?? "/default-avatar.png"}
                  alt={candidate.user.displayName}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback className="from-primary to-primary/80 bg-gradient-to-br text-2xl font-semibold text-white">
                  {candidate.user.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500 dark:border-gray-800">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {candidate.user.displayName}
                </h2>
                <p className="text-primary font-medium">
                  @{candidate.user.username}
                </p>
              </div>

              <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
                {candidate.user.age && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1 dark:bg-gray-800">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{candidate.user.age} years old</span>
                  </div>
                )}
                {candidate.profile.location.city && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1 dark:bg-gray-800">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {candidate.profile.location.city} •{" "}
                      {Math.round(candidate.distance)}km away
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1 dark:bg-gray-800">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatLastActive(candidate.lastActive)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Match Score Badge */}
          <div
            className={`rounded-xl border-2 p-4 text-center ${getScoreBg(candidate.score.overall)}`}
          >
            <div className="mb-1 flex items-center justify-center gap-1">
              <Sparkles className="text-primary h-4 w-4" />
              <div
                className={`text-3xl font-bold ${getScoreColor(candidate.score.overall)}`}
              >
                {candidate.score.overall}%
              </div>
            </div>
            <p className="text-muted-foreground text-xs font-medium">
              {getScoreLabel(candidate.score.overall)}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="space-y-8 p-6">
        {/* Bio */}
        {candidate.user.bio && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
            <h4 className="mb-3 flex items-center gap-2 font-semibold">
              <Users className="text-primary h-4 w-4" />
              About
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {candidate.user.bio}
            </p>
          </div>
        )}

        {/* Samples */}
        {candidate.user.samples && candidate.user.samples.length > 0 && (
          <div>
            <h4 className="mb-4 flex items-center gap-2 font-semibold">
              <Play className="text-primary h-4 w-4" />
              Music Samples
              <Badge variant="secondary" className="ml-2">
                {candidate.user.samples.length}
              </Badge>
            </h4>
            <div className="space-y-3">
              {candidate.user.samples.map((sample) => (
                <div
                  key={sample.id}
                  className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <AudioPlayer
                    src={sample.fileUrl}
                    title={sample.title}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instruments */}
        {candidate.profile.instruments.length > 0 && (
          <div>
            <h4 className="mb-4 flex items-center gap-2 font-semibold">
              <Music className="text-primary h-4 w-4" />
              Instruments
              <Badge variant="secondary" className="ml-2">
                {candidate.profile.instruments.length}
              </Badge>
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {candidate.profile.instruments.map((instrument) => (
                <div
                  key={instrument.id}
                  className={`rounded-lg border p-3 transition-all duration-200 hover:shadow-md ${
                    instrument.isPrimary
                      ? "bg-primary/5 border-primary/20 ring-primary/10 ring-1"
                      : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {instrument.name}
                        </span>
                        {instrument.isPrimary && (
                          <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {instrument.skillLevel}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {instrument.yearsOfExperience}+ years
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Genres */}
        {candidate.profile.genres.length > 0 && (
          <div>
            <h4 className="mb-4 flex items-center gap-2 font-semibold">
              <TrendingUp className="text-primary h-4 w-4" />
              Music Genres
              <Badge variant="secondary" className="ml-2">
                {candidate.profile.genres.length}
              </Badge>
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.profile.genres.map((genre) => (
                <Badge
                  key={genre.id}
                  variant={genre.preference >= 4 ? "default" : "outline"}
                  className={`text-sm transition-all duration-200 hover:scale-105 ${
                    genre.preference >= 4
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : ""
                  }`}
                >
                  {genre.name}
                  {genre.preference >= 4 && (
                    <Heart className="ml-1 h-3 w-3 fill-current" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Match Breakdown */}
        <div className="from-primary/5 border-primary/10 rounded-xl border bg-gradient-to-r to-transparent p-5">
          <h4 className="mb-4 flex items-center gap-2 font-semibold">
            <Sparkles className="text-primary h-4 w-4" />
            Compatibility Breakdown
          </h4>
          <div className="space-y-4">
            {[
              {
                label: "Location",
                value: candidate.score.factors.location,
                icon: MapPin,
              },
              {
                label: "Musical Genres",
                value: candidate.score.factors.genres,
                icon: TrendingUp,
              },
              {
                label: "Instruments",
                value: candidate.score.factors.instruments,
                icon: Music,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress
                    value={value}
                    className="h-2 w-20 bg-gray-200 dark:bg-gray-700"
                  />
                  <span className="w-10 text-right text-sm font-medium">
                    {Math.round(value)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Match Explanation */}
        {candidate.score.explanation.length > 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
            <h4 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">
              Why you&apos;re a great match
            </h4>
            <ul className="space-y-2">
              {candidate.score.explanation.map((reason, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200"
                >
                  <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></div>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full border-2 p-0 transition-all duration-200 hover:scale-110 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={() => onInteraction("pass")}
          >
            <X className="h-6 w-6 text-red-500" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full border-2 p-0 transition-all duration-200 hover:scale-110 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            onClick={() => onInteraction("super_like")}
          >
            <Star className="h-6 w-6 text-amber-500" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full border-2 p-0 transition-all duration-200 hover:scale-110 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/30"
            onClick={() => onInteraction("like")}
          >
            <Heart className="h-6 w-6 text-green-500" />
          </Button>
        </div>

        {/* View Profile Link */}
        <div className="pt-2 text-center">
          <Link
            href={`/u/${candidate.user.username}`}
            className="bg-primary/10 hover:bg-primary/20 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-all duration-200 hover:scale-105"
          >
            <Eye className="h-4 w-4" />
            View Full Profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
