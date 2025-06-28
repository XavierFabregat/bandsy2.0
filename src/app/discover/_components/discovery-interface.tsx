"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  X,
  Star,
  Eye,
  MapPin,
  Calendar,
  Music,
  RefreshCw,
} from "lucide-react";
import { discoverUsers, recordInteraction } from "@/lib/api";
import type {
  MatchCandidate,
  DiscoveryFilters,
} from "@/lib/matching/types/matching-types";
import { DiscoveryFilters as FilterComponent } from "./discovery-filters";
import Link from "next/link";

export function DiscoveryInterface() {
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DiscoveryFilters>({
    maxDistance: 50,
    isActive: true,
  });
  const [showFilters, setShowFilters] = useState(false);

  const currentCandidate = candidates[currentIndex];

  const loadCandidates = useCallback(
    async (filtersToUse?: DiscoveryFilters) => {
      try {
        setLoading(true);
        const result = await discoverUsers(filtersToUse ?? filters, {
          page: 1,
          limit: 20,
        });
        setCandidates(result.candidates);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Failed to load candidates:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  // Only load candidates on initial mount
  useEffect(() => {
    void loadCandidates();
  }, []); // Empty dependency array - only runs once

  // Manual refresh function
  const handleRefresh = () => {
    void loadCandidates(filters);
  };

  const handleInteraction = async (action: "like" | "pass" | "super_like") => {
    if (!currentCandidate) return;

    try {
      await recordInteraction(currentCandidate.user.id, action, "discovery");

      // Move to next candidate
      if (currentIndex < candidates.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Load more candidates when running low
        void loadCandidates();
      }
    } catch (error) {
      console.error("Failed to record interaction:", error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  const getScoreColorBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">
            Finding your perfect matches...
          </p>
        </div>
      </div>
    );
  }

  if (!currentCandidate) {
    return (
      <div className="py-12 text-center">
        {/* Filters Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
        </div>
        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <FilterComponent
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleRefresh}
            />
          </div>
        )}
        <h3 className="mb-2 text-xl font-semibold">No more profiles!</h3>
        <p className="text-muted-foreground mb-4">
          You&apos;ve seen all available matches. Try adjusting your filters or
          check back later.
        </p>
        <Button onClick={handleRefresh}>Refresh</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Filters Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {currentIndex + 1} of {candidates.length} profiles
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6">
          <FilterComponent
            filters={filters}
            onFiltersChange={setFilters}
            onApplyFilters={handleRefresh}
          />
        </div>
      )}

      {/* Main Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={
                    currentCandidate.user.profileImageUrl ??
                    "/default-avatar.png"
                  }
                />
                <AvatarFallback className="text-2xl">
                  {currentCandidate.user.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {currentCandidate.user.displayName}
                </h2>
                <p className="text-muted-foreground">
                  @{currentCandidate.user.username}
                </p>
                {currentCandidate.user.age && (
                  <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4" />
                    {currentCandidate.user.age} years old
                  </p>
                )}
                {currentCandidate.profile.location.city && (
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    {currentCandidate.profile.location.city} (
                    {Math.round(currentCandidate.distance)}km away)
                  </p>
                )}
              </div>
            </div>

            {/* Match Score */}
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${getScoreColor(currentCandidate.score.overall)}`}
              >
                {currentCandidate.score.overall}%
              </div>
              <p className="text-muted-foreground text-xs">Match</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Bio */}
          {currentCandidate.user.bio && (
            <div>
              <h4 className="mb-2 font-semibold">About</h4>
              <p className="text-muted-foreground">
                {currentCandidate.user.bio}
              </p>
            </div>
          )}

          {/* Instruments */}
          {currentCandidate.profile.instruments.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-semibold">
                <Music className="h-4 w-4" />
                Instruments
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentCandidate.profile.instruments.map((instrument) => (
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
          {currentCandidate.profile.genres.length > 0 && (
            <div>
              <h4 className="mb-3 font-semibold">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {currentCandidate.profile.genres.map((genre) => (
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
                    value={currentCandidate.score.factors.location}
                    className="h-2 w-16"
                  />
                  <span className="w-8 text-sm">
                    {Math.round(currentCandidate.score.factors.location)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Genres</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={currentCandidate.score.factors.genres}
                    className="h-2 w-16"
                  />
                  <span className="w-8 text-sm">
                    {Math.round(currentCandidate.score.factors.genres)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Instruments</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={currentCandidate.score.factors.instruments}
                    className="h-2 w-16"
                  />
                  <span className="w-8 text-sm">
                    {Math.round(currentCandidate.score.factors.instruments)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Match Explanation */}
            {currentCandidate.score.explanation.length > 0 && (
              <div className="bg-muted mt-3 rounded-lg p-3">
                <ul className="text-muted-foreground space-y-1 text-sm">
                  {currentCandidate.score.explanation.map((reason, index) => (
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
              onClick={() => handleInteraction("pass")}
            >
              <X className="h-6 w-6 text-red-500" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-full p-0"
              onClick={() => handleInteraction("super_like")}
            >
              <Star className="h-6 w-6 text-yellow-500" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-full p-0"
              onClick={() => handleInteraction("like")}
            >
              <Heart className="h-6 w-6 text-green-500" />
            </Button>
          </div>

          {/* View Profile Link */}
          <div className="pt-2 text-center">
            <Link
              href={`/u/${currentCandidate.user.username}`}
              className="text-primary inline-flex items-center gap-1 hover:underline"
            >
              <Eye className="h-4 w-4" />
              View Full Profile
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
