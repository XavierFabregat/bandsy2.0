"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Star,
  Eye,
  MapPin,
  Calendar,
  Music,
  Play,
  TrendingUp,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { MatchCandidate } from "@/lib/matching/types/matching-types";
import Link from "next/link";
import AudioPlayer from "../../samples/_components/audio-player";

interface CandidateCardProps {
  candidate: MatchCandidate;
  onInteraction: (action: "pass" | "invite") => void;
}

export function CandidateCard({
  candidate,
  onInteraction,
}: CandidateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60),
    );
    if (diffInHours < 1) return "Active now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return "Recently active";
  };

  const primaryInstruments = candidate.profile.instruments
    .filter((i) => i.isPrimary)
    .slice(0, 2);
  const topInstruments =
    primaryInstruments.length > 0
      ? primaryInstruments
      : candidate.profile.instruments.slice(0, 2);

  const topGenres = candidate.profile.genres
    .sort((a, b) => b.preference - a.preference)
    .slice(0, 3);

  return (
    <Card className="max-h-[90vh] overflow-hidden border-0 bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg dark:from-gray-950 dark:via-gray-950 dark:to-gray-900/50">
      {/* Compact Header */}
      <div className="from-primary/10 via-primary/5 relative border-b border-gray-100 bg-gradient-to-r to-transparent p-4 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-white dark:ring-gray-800">
                <AvatarImage
                  src={candidate.user.profileImageUrl ?? "/default-avatar.png"}
                  alt={candidate.user.displayName}
                />
                <AvatarFallback className="from-primary to-primary/80 bg-gradient-to-br text-lg font-semibold text-white">
                  {candidate.user.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-gray-800"></div>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold">
                {candidate.user.displayName}
              </h2>
              <p className="text-primary text-sm font-medium">
                @{candidate.user.username}
              </p>
              <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                {candidate.user.age && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {candidate.user.age}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {Math.round(candidate.distance)}km
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatLastActive(candidate.lastActive)}
                </span>
              </div>
            </div>
          </div>

          {/* Match Score */}
          <div
            className={`rounded-lg border-2 p-3 text-center ${getScoreBg(candidate.score.overall)}`}
          >
            <div
              className={`text-2xl font-bold ${getScoreColor(candidate.score.overall)}`}
            >
              {candidate.score.overall}%
            </div>
            <p className="text-muted-foreground text-xs">Match</p>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Essential Info - Always Visible */}
        <div className="space-y-4">
          {/* Top Instruments */}
          {topInstruments.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Music className="text-primary h-4 w-4" />
                <span className="text-sm font-medium">Instruments</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {topInstruments.map((instrument) => (
                  <Badge
                    key={instrument.id}
                    variant={instrument.isPrimary ? "default" : "outline"}
                    className="text-xs"
                  >
                    {instrument.name}
                    {instrument.isPrimary && (
                      <Star className="ml-1 h-3 w-3 fill-current" />
                    )}
                  </Badge>
                ))}
                {candidate.profile.instruments.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{candidate.profile.instruments.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Top Genres */}
          {topGenres.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="text-primary h-4 w-4" />
                <span className="text-sm font-medium">Genres</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {topGenres.map((genre) => (
                  <Badge
                    key={genre.id}
                    variant={genre.preference >= 4 ? "default" : "outline"}
                    className="text-xs"
                  >
                    {genre.name}
                  </Badge>
                ))}
                {candidate.profile.genres.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{candidate.profile.genres.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Quick Match Insights */}
          <div className="border-primary/20 bg-primary/5 rounded-lg border p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Compatibility</span>
              <span className="text-primary font-bold">
                {candidate.score.overall}%
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs">
                  <span>Music</span>
                  <span>{Math.round(candidate.score.factors.genres)}%</span>
                </div>
                <Progress
                  value={candidate.score.factors.genres}
                  className="h-1"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs">
                  <span>Location</span>
                  <span>{Math.round(candidate.score.factors.location)}%</span>
                </div>
                <Progress
                  value={candidate.score.factors.location}
                  className="h-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="mt-4 w-full justify-between p-2">
              <span className="text-sm">
                {isExpanded ? "Show Less" : "Show More Details"}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 pt-4">
            {/* Bio */}
            {candidate.user.bio && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Users className="text-primary h-4 w-4" />
                  About
                </h4>
                <p className="text-muted-foreground text-sm">
                  {candidate.user.bio}
                </p>
              </div>
            )}

            {/* Samples */}
            {candidate.user.samples && candidate.user.samples.length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Play className="text-primary h-4 w-4" />
                  Music Samples
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {candidate.user.samples.length}
                  </Badge>
                </h4>
                <div className="space-y-2">
                  {candidate.user.samples.slice(0, 2).map((sample) => (
                    <div
                      key={sample.id}
                      className="rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-900"
                    >
                      <AudioPlayer
                        src={sample.fileUrl}
                        title={sample.title}
                        className="w-full"
                      />
                    </div>
                  ))}
                  {candidate.user.samples.length > 2 && (
                    <p className="text-muted-foreground text-center text-xs">
                      +{candidate.user.samples.length - 2} more samples
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* All Instruments */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Music className="text-primary h-4 w-4" />
                All Instruments
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {candidate.profile.instruments.map((instrument) => (
                  <div
                    key={instrument.id}
                    className={`rounded-lg border p-2 text-xs ${
                      instrument.isPrimary
                        ? "border-primary/20 bg-primary/5"
                        : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{instrument.name}</span>
                      {instrument.isPrimary && (
                        <Star className="h-3 w-3 fill-current text-amber-500" />
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs capitalize">
                        {instrument.skillLevel}
                      </Badge>
                      <span>{instrument.yearsOfExperience}+ yrs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Match Explanation */}
            {candidate.score.explanation.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                <h4 className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                  Why you&apos;re compatible
                </h4>
                <ul className="space-y-1">
                  {candidate.score.explanation
                    .slice(0, 3)
                    .map((reason, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-xs text-blue-800 dark:text-blue-200"
                      >
                        <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-500"></div>
                        <span>{reason}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* View Profile Link */}
        <div className="mt-4 text-center">
          <Link
            href={`/u/${candidate.user.username}`}
            className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
          >
            <Eye className="h-4 w-4" />
            View Full Profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
