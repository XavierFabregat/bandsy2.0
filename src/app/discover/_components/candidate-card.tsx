"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Heart,
  X,
  Star,
  Eye,
  MapPin,
  Calendar,
  Music,
  Play,
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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  console.log("candidate ==>", candidate);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={candidate.user.profileImageUrl ?? "/default-avatar.png"}
                alt={candidate.user.displayName}
                className="h-full w-full object-cover"
              />
              <AvatarFallback className="text-2xl">
                {candidate.user.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">
                {candidate.user.displayName}
              </h2>
              <p className="text-muted-foreground">
                @{candidate.user.username}
              </p>
              {candidate.user.age && (
                <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  {candidate.user.age} years old
                </p>
              )}
              {candidate.profile.location.city && (
                <p className="text-muted-foreground flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  {candidate.profile.location.city} (
                  {Math.round(candidate.distance)}km away)
                </p>
              )}
            </div>
          </div>

          {/* Match Score */}
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getScoreColor(candidate.score.overall)}`}
            >
              {candidate.score.overall}%
            </div>
            <p className="text-muted-foreground text-xs">Match</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Bio */}
        {candidate.user.bio && (
          <div>
            <h4 className="mb-2 font-semibold">About</h4>
            <p className="text-muted-foreground">{candidate.user.bio}</p>
          </div>
        )}

        {/* Instruments */}
        {candidate.profile.instruments.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold">
              <Music className="h-4 w-4" />
              Instruments
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.profile.instruments.map((instrument) => (
                <Badge
                  key={instrument.id}
                  variant={instrument.isPrimary ? "default" : "secondary"}
                  className="text-sm"
                >
                  {instrument.name} ({instrument.skillLevel})
                  {instrument.isPrimary && " ⭐"}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Genres */}
        {candidate.profile.genres.length > 0 && (
          <div>
            <h4 className="mb-3 font-semibold">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {candidate.profile.genres.map((genre) => (
                <Badge key={genre.id} variant="outline" className="text-sm">
                  {genre.name}
                  {genre.preference >= 4 && " 💖"}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Match Breakdown */}
        <div>
          <h4 className="mb-3 font-semibold">Why you match</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Location</span>
              <div className="flex items-center gap-2">
                <Progress
                  value={candidate.score.factors.location}
                  className="h-2 w-16"
                />
                <span className="w-8 text-sm">
                  {Math.round(candidate.score.factors.location)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Genres</span>
              <div className="flex items-center gap-2">
                <Progress
                  value={candidate.score.factors.genres}
                  className="h-2 w-16"
                />
                <span className="w-8 text-sm">
                  {Math.round(candidate.score.factors.genres)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Instruments</span>
              <div className="flex items-center gap-2">
                <Progress
                  value={candidate.score.factors.instruments}
                  className="h-2 w-16"
                />
                <span className="w-8 text-sm">
                  {Math.round(candidate.score.factors.instruments)}%
                </span>
              </div>
            </div>
          </div>

          {/* Samples */}
          {candidate.user.samples && candidate.user.samples.length > 0 && (
            <div>
              <h4 className="mb-3 font-semibold">Samples</h4>
              <div className="flex flex-wrap gap-2">
                {candidate.user.samples.map((sample) => (
                  <AudioPlayer
                    key={sample.id}
                    src={sample.fileUrl}
                    title={sample.title}
                    className="w-full"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Match Explanation */}
          {candidate.score.explanation.length > 0 && (
            <div className="bg-muted mt-3 rounded-lg p-3">
              <ul className="text-muted-foreground space-y-1 text-sm">
                {candidate.score.explanation.map((reason, index) => (
                  <li key={index}>• {reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full p-0"
            onClick={() => onInteraction("pass")}
          >
            <X className="h-6 w-6 text-red-500" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full p-0"
            onClick={() => onInteraction("super_like")}
          >
            <Star className="h-6 w-6 text-yellow-500" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full p-0"
            onClick={() => onInteraction("like")}
          >
            <Heart className="h-6 w-6 text-green-500" />
          </Button>
        </div>

        {/* View Profile Link */}
        <div className="pt-2 text-center">
          <Link
            href={`/u/${candidate.user.username}`}
            className="text-primary inline-flex items-center gap-1 hover:underline"
          >
            <Eye className="h-4 w-4" />
            View Full Profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
