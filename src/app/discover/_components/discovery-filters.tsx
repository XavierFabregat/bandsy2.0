"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { DiscoveryFilters } from "@/lib/matching/types/matching-types";
import { getInstruments, getGenres } from "@/lib/api";

interface DiscoveryFiltersProps {
  filters: DiscoveryFilters;
  onFiltersChange: (filters: DiscoveryFilters) => void;
  onApplyFilters?: () => void;
}

export function DiscoveryFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
}: DiscoveryFiltersProps) {
  const [instruments, setInstruments] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [genres, setGenres] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [instrumentsData, genresData] = await Promise.all([
          getInstruments(),
          getGenres(),
        ]);
        setInstruments(instrumentsData);
        setGenres(genresData);
      } catch (error) {
        console.error("Failed to load filter data:", error);
      }
    };

    void loadData();
  }, []);

  const toggleArrayFilter = (
    key: "instruments" | "genres" | "skillLevel" | "lookingFor",
    value: string,
  ) => {
    const currentArray = filters[key] ?? [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    onFiltersChange({
      ...filters,
      [key]: newArray.length > 0 ? newArray : undefined,
    });
  };

  const updateDistance = (value: number) => {
    onFiltersChange({
      ...filters,
      maxDistance: value,
    });
  };

  const updateAgeRange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      ageRange: { min, max },
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      maxDistance: 50,
      isActive: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Discovery Filters</CardTitle>
          <div className="flex gap-2">
            {onApplyFilters && (
              <Button size="sm" onClick={onApplyFilters}>
                Apply Filters
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Distance */}
        <div>
          <label className="mb-3 block text-sm font-medium">
            Maximum Distance (km)
          </label>
          <input
            type="number"
            value={filters.maxDistance ?? 50}
            onChange={(e) => updateDistance(parseInt(e.target.value) || 50)}
            min={5}
            max={200}
            step={5}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
          />
        </div>

        {/* Age Range */}
        <div>
          <label className="mb-3 block text-sm font-medium">Age Range</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-muted-foreground mb-1 block text-xs">
                Min Age
              </label>
              <input
                type="number"
                value={filters.ageRange?.min ?? 18}
                onChange={(e) =>
                  updateAgeRange(
                    parseInt(e.target.value) || 18,
                    filters.ageRange?.max ?? 65,
                  )
                }
                min={18}
                max={65}
                step={1}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-muted-foreground mb-1 block text-xs">
                Max Age
              </label>
              <input
                type="number"
                value={filters.ageRange?.max ?? 65}
                onChange={(e) =>
                  updateAgeRange(
                    filters.ageRange?.min ?? 18,
                    parseInt(e.target.value) || 65,
                  )
                }
                min={18}
                max={65}
                step={1}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Instruments */}
        <div>
          <label className="mb-3 block text-sm font-medium">Instruments</label>
          <div className="flex flex-wrap gap-2">
            {instruments.slice(0, 12).map((instrument) => (
              <Badge
                key={instrument.id}
                variant={
                  filters.instruments?.includes(instrument.name)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer"
                onClick={() =>
                  toggleArrayFilter("instruments", instrument.name)
                }
              >
                {instrument.name}
                {filters.instruments?.includes(instrument.name) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div>
          <label className="mb-3 block text-sm font-medium">Genres</label>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 12).map((genre) => (
              <Badge
                key={genre.id}
                variant={
                  filters.genres?.includes(genre.name) ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => toggleArrayFilter("genres", genre.name)}
              >
                {genre.name}
                {filters.genres?.includes(genre.name) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Skill Level */}
        <div>
          <label className="mb-3 block text-sm font-medium">Skill Level</label>
          <div className="flex flex-wrap gap-2">
            {["beginner", "intermediate", "advanced", "professional"].map(
              (level) => (
                <Badge
                  key={level}
                  variant={
                    filters.skillLevel?.includes(level) ? "default" : "outline"
                  }
                  className="cursor-pointer capitalize"
                  onClick={() => toggleArrayFilter("skillLevel", level)}
                >
                  {level}
                  {filters.skillLevel?.includes(level) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ),
            )}
          </div>
        </div>

        {/* Looking For */}
        <div>
          <label className="mb-3 block text-sm font-medium">Looking For</label>
          <div className="flex flex-wrap gap-2">
            {["band", "jam_session", "collaboration", "lessons"].map((type) => (
              <Badge
                key={type}
                variant={
                  filters.lookingFor?.includes(type) ? "default" : "outline"
                }
                className="cursor-pointer capitalize"
                onClick={() => toggleArrayFilter("lookingFor", type)}
              >
                {type.replace("_", " ")}
                {filters.lookingFor?.includes(type) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
