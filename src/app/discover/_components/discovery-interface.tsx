"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { discoverUsers, recordInteraction } from "@/lib/api";
import type {
  MatchCandidate,
  DiscoveryFilters,
} from "@/lib/matching/types/matching-types";
import { DiscoveryFilters as FilterComponent } from "./discovery-filters";
import { CandidateCard } from "./candidate-card";

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
      <CandidateCard
        candidate={currentCandidate}
        onInteraction={handleInteraction}
      />
    </div>
  );
}
