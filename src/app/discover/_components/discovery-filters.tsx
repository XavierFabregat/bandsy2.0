"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Filter,
  MapPin,
  Calendar,
  Music,
  Palette,
  Target,
  Search,
  Sliders,
  RotateCcw,
} from "lucide-react";
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.maxDistance !== 50) count++;
    if (
      filters.ageRange &&
      (filters.ageRange.min !== 18 || filters.ageRange.max !== 65)
    )
      count++;
    if (filters.instruments?.length) count++;
    if (filters.genres?.length) count++;
    if (filters.skillLevel?.length) count++;
    if (filters.lookingFor?.length) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg dark:from-gray-950 dark:to-gray-900/50">
      <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Filter className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                Discovery Filters
              </CardTitle>
              {activeFiltersCount > 0 && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {activeFiltersCount} filter
                  {activeFiltersCount !== 1 ? "s" : ""} applied
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {onApplyFilters && (
              <Button
                size="sm"
                onClick={onApplyFilters}
                className="bg-primary hover:bg-primary/90 text-white shadow-sm"
              >
                <Search className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        {/* Distance */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-blue-100 p-1.5 dark:bg-blue-900/30">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Maximum Distance
              </label>
              <p className="text-muted-foreground text-xs">
                Search within {filters.maxDistance ?? 50}km radius
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <input
              type="number"
              value={filters.maxDistance ?? 50}
              onChange={(e) => updateDistance(parseInt(e.target.value) || 50)}
              min={5}
              max={200}
              step={5}
              className="w-full border-0 bg-transparent p-0 text-lg font-medium focus:ring-0 focus:outline-none"
              placeholder="50"
            />
            <div className="text-muted-foreground mt-2 flex justify-between text-xs">
              <span>5km</span>
              <span>200km</span>
            </div>
          </div>
        </div>

        {/* Age Range */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-green-100 p-1.5 dark:bg-green-900/30">
              <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Age Range
              </label>
              <p className="text-muted-foreground text-xs">
                {filters.ageRange?.min ?? 18} - {filters.ageRange?.max ?? 65}{" "}
                years old
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <label className="text-muted-foreground mb-2 block text-xs font-medium">
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
                className="w-full border-0 bg-transparent p-0 text-lg font-medium focus:ring-0 focus:outline-none"
              />
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <label className="text-muted-foreground mb-2 block text-xs font-medium">
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
                className="w-full border-0 bg-transparent p-0 text-lg font-medium focus:ring-0 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Instruments */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-purple-100 p-1.5 dark:bg-purple-900/30">
              <Music className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Instruments
              </label>
              <p className="text-muted-foreground text-xs">
                {filters.instruments?.length
                  ? `${filters.instruments.length} selected`
                  : "All instruments"}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-wrap gap-2">
              {instruments.slice(0, 12).map((instrument) => (
                <Badge
                  key={instrument.id}
                  variant={
                    filters.instruments?.includes(instrument.name)
                      ? "default"
                      : "outline"
                  }
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    filters.instruments?.includes(instrument.name)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
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
        </div>

        {/* Genres */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-orange-100 p-1.5 dark:bg-orange-900/30">
              <Palette className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Genres
              </label>
              <p className="text-muted-foreground text-xs">
                {filters.genres?.length
                  ? `${filters.genres.length} selected`
                  : "All genres"}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 12).map((genre) => (
                <Badge
                  key={genre.id}
                  variant={
                    filters.genres?.includes(genre.name) ? "default" : "outline"
                  }
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    filters.genres?.includes(genre.name)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
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
        </div>

        {/* Skill Level */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-red-100 p-1.5 dark:bg-red-900/30">
              <Sliders className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Skill Level
              </label>
              <p className="text-muted-foreground text-xs">
                {filters.skillLevel?.length
                  ? `${filters.skillLevel.length} selected`
                  : "All skill levels"}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-wrap gap-2">
              {["beginner", "intermediate", "advanced", "professional"].map(
                (level) => (
                  <Badge
                    key={level}
                    variant={
                      filters.skillLevel?.includes(level)
                        ? "default"
                        : "outline"
                    }
                    className={`cursor-pointer capitalize transition-all duration-200 hover:scale-105 ${
                      filters.skillLevel?.includes(level)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
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
        </div>

        {/* Looking For */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-teal-100 p-1.5 dark:bg-teal-900/30">
              <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Looking For
              </label>
              <p className="text-muted-foreground text-xs">
                {filters.lookingFor?.length
                  ? `${filters.lookingFor.length} selected`
                  : "Open to anything"}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-wrap gap-2">
              {["band", "jam_session", "collaboration", "lessons"].map(
                (type) => (
                  <Badge
                    key={type}
                    variant={
                      filters.lookingFor?.includes(type) ? "default" : "outline"
                    }
                    className={`cursor-pointer capitalize transition-all duration-200 hover:scale-105 ${
                      filters.lookingFor?.includes(type)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => toggleArrayFilter("lookingFor", type)}
                  >
                    {type.replace("_", " ")}
                    {filters.lookingFor?.includes(type) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ),
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
