"use client";

import { useState } from "react";
import { updateGenres } from "../_actions/genres";

interface Genre {
  id: string;
  name: string;
  parentGenreId: string | null;
}

interface UserGenre {
  genreId: string;
  preference: number | null;
}

interface GenresFormProps {
  genres: Genre[];
  userGenres: UserGenre[];
}

export function GenresForm({ genres, userGenres }: GenresFormProps) {
  const [formGenres, setFormGenres] = useState<UserGenre[]>(
    userGenres.length > 0 ? userGenres : [],
  );

  // Group genres by parent (main genres and sub-genres)
  const mainGenres = genres.filter((genre) => !genre.parentGenreId);
  // const subGenres = genres.filter((genre) => genre.parentGenreId);

  const addGenre = () => {
    const newGenre = {
      genreId: "",
      preference: formGenres.length === 0 ? 5 : 1, // First genre gets highest preference
    };

    setFormGenres((prev) => [...prev, newGenre]);
  };

  const removeGenre = (index: number) => {
    const newGenres = formGenres.filter((_, i) => i !== index);

    // If we removed the highest preference genre, make the first one highest
    if (formGenres[index]?.preference === 5 && newGenres.length > 0) {
      newGenres[0]!.preference = 5;
    }

    setFormGenres(newGenres);
  };

  const updateGenre = (index: number, updates: Partial<UserGenre>) => {
    const newGenres = [...formGenres];
    newGenres[index] = { ...newGenres[index]!, ...updates };

    // If setting this as highest preference, adjust others
    if (updates.preference === 5) {
      newGenres.forEach((genre, i) => {
        if (i !== index && genre.preference === 5) {
          genre.preference = 4;
        }
      });
    }

    setFormGenres(newGenres);
  };

  const setPrimaryGenre = (index: number) => {
    const newGenres = [...formGenres];
    newGenres.forEach((genre, i) => {
      if (i === index) {
        genre.preference = 5;
      } else if (genre.preference === 5) {
        genre.preference = 4;
      }
    });
    setFormGenres(newGenres);
  };

  // const getSubGenresForParent = (parentId: string) => {
  //   return subGenres.filter((genre) => genre.parentGenreId === parentId);
  // };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-medium">
          What genres do you play?
        </h3>
        <p className="text-muted-foreground text-sm">
          Select the genres you play, and mark your primary one
        </p>
      </div>

      <form action={updateGenres}>
        {/* Genres List */}
        <div className="space-y-4">
          {formGenres.map((genre, index) => (
            <div
              key={index}
              className="bg-muted border-border rounded-lg border p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-foreground font-medium">
                  Genre {index + 1}
                </h4>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={genre.preference === 5}
                      onChange={(_e) => setPrimaryGenre(index)}
                      className="border-border text-primary focus:ring-primary h-4 w-4 rounded border focus:ring-2"
                    />
                    Primary
                  </label>
                  <button
                    type="button"
                    onClick={() => removeGenre(index)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Main Genre Selection */}
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Main Genre *
                  </label>
                  <select
                    name={`genres[${index}][genreId]`}
                    value={genre.genreId}
                    onChange={(e) =>
                      updateGenre(index, { genreId: e.target.value })
                    }
                    className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                    required
                  >
                    <option value="">Select a genre</option>
                    {mainGenres.map((mainGenre) => (
                      <option key={mainGenre.id} value={mainGenre.id}>
                        {mainGenre.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hidden field for preference */}
                <input
                  type="hidden"
                  name={`genres[${index}][isPrimary]`}
                  value={(genre.preference === 5).toString()}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add Genre Button */}
        <button
          type="button"
          onClick={addGenre}
          className="border-border text-foreground hover:bg-muted w-full rounded-lg border-2 border-dashed p-4 text-center transition-colors"
        >
          + Add Another Genre
        </button>

        <div className="bg-muted border-border rounded-lg border p-4">
          <h3 className="text-foreground mb-2 font-medium">Tips:</h3>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• Mark your main genre as &quot;Primary&quot;</li>
            <li>• You can add multiple genres to show your versatility</li>
            <li>
              • This helps match you with musicians who play similar styles
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between">
          <a
            href="/profile/setup/instruments"
            className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2 font-medium transition-colors"
          >
            Previous
          </a>

          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 font-medium transition-colors"
          >
            Next: Location
          </button>
        </div>
      </form>
    </div>
  );
}
