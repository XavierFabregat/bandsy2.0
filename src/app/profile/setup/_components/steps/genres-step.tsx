"use client";

import { useState, useEffect } from "react";
import type { ProfileSetupData } from "../profile-setup-wizard";

interface GenresStepProps {
  formData: ProfileSetupData;
  updateFormData: (updates: Partial<ProfileSetupData>) => void;
  userId: string;
}

interface Genre {
  id: string;
  name: string;
  parentGenreId: string | null;
}

export function GenresStep({ formData, updateFormData }: GenresStepProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("/api/genres");
        if (response.ok) {
          const data = (await response.json()) as Genre[];
          setGenres(data);
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchGenres();
  }, []);

  const toggleGenre = (genreId: string) => {
    const existingIndex = formData.genres.findIndex(
      (g) => g.genreId === genreId,
    );

    if (existingIndex >= 0) {
      // Remove genre
      const newGenres = formData.genres.filter((g) => g.genreId !== genreId);
      updateFormData({ genres: newGenres });
    } else {
      // Add genre with default preference
      const newGenre = { genreId, preference: 3 };
      updateFormData({ genres: [...formData.genres, newGenre] });
    }
  };

  const updatePreference = (genreId: string, preference: number) => {
    const newGenres = formData.genres.map((g) =>
      g.genreId === genreId ? { ...g, preference } : g,
    );
    updateFormData({ genres: newGenres });
  };

  const isSelected = (genreId: string) => {
    return formData.genres.some((g) => g.genreId === genreId);
  };

  const getPreference = (genreId: string) => {
    return formData.genres.find((g) => g.genreId === genreId)?.preference ?? 3;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <span className="text-muted-foreground ml-2">Loading genres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-medium">
          What genres do you enjoy?
        </h3>
        <p className="text-muted-foreground text-sm">
          Select your favorite genres and rate your preference (1-5)
        </p>
      </div>

      {/* Genre Selection */}
      <div className="grid gap-3 md:grid-cols-3">
        {genres.map((genre) => (
          <button
            key={genre.id}
            type="button"
            onClick={() => toggleGenre(genre.id)}
            className={`border-border text-foreground hover:bg-muted rounded-lg border p-3 text-left transition-colors ${
              isSelected(genre.id)
                ? "border-primary bg-primary/10"
                : "hover:border-primary/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{genre.name}</span>
              {isSelected(genre.id) && <span className="text-primary">✓</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Genres with Preferences */}
      {formData.genres.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-foreground font-medium">
            Rate your preferences:
          </h4>
          {formData.genres.map((genre) => {
            const genreInfo = genres.find((g) => g.id === genre.genreId);
            return (
              <div
                key={genre.genreId}
                className="bg-muted border-border rounded-lg border p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium">{genreInfo?.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleGenre(genre.genreId)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-foreground block text-sm">
                    Preference Level: {genre.preference}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={genre.preference}
                    onChange={(e) =>
                      updatePreference(genre.genreId, parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>Not my style</span>
                    <span>Love it!</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-muted border-border rounded-lg border p-4">
        <h3 className="text-foreground mb-2 font-medium">Tips:</h3>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>• Select genres you&apos;re passionate about</li>
          <li>• Rate your preferences to help with better matching</li>
          <li>• You can always update your preferences later</li>
        </ul>
      </div>
    </div>
  );
}
