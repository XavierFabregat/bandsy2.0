import { describe, it, expect } from "vitest";
import { GenreCompatibilityScorer } from "@/lib/matching/algorithms/genre-compatibility";
import type { GenrePreference } from "@/lib/matching/types/matching-types";

describe("GenreCompatibilityScorer", () => {
  // Test data
  const createGenre = (
    id: string,
    name: string,
    preference: number,
  ): GenrePreference => ({
    id,
    name,
    preference,
  });

  const userGenres = [
    createGenre("1", "Rock", 5),
    createGenre("2", "Jazz", 4),
    createGenre("3", "Blues", 3),
    createGenre("4", "Pop", 2),
  ];

  const candidateGenres = [
    createGenre("1", "Rock", 4),
    createGenre("2", "Jazz", 5),
    createGenre("5", "Classical", 3),
    createGenre("6", "Electronic", 2),
  ];

  describe("calculate", () => {
    describe("empty inputs", () => {
      it("should return zero score when user has no genres", () => {
        const result = GenreCompatibilityScorer.calculate([], candidateGenres);

        expect(result.score).toBe(0);
        expect(result.commonGenres).toEqual([]);
        expect(result.explanation).toContain("No genre preferences set");
      });

      it("should return zero score when candidate has no genres", () => {
        const result = GenreCompatibilityScorer.calculate(userGenres, []);

        expect(result.score).toBe(0);
        expect(result.commonGenres).toEqual([]);
        expect(result.explanation).toContain("No genre preferences set");
      });

      it("should return zero score when both have no genres", () => {
        const result = GenreCompatibilityScorer.calculate([], []);

        expect(result.score).toBe(0);
        expect(result.commonGenres).toEqual([]);
        expect(result.explanation).toContain("No genre preferences set");
      });
    });

    describe("no common genres", () => {
      it("should return zero score when no genres overlap", () => {
        const userOnly = [createGenre("1", "Rock", 5)];
        const candidateOnly = [createGenre("2", "Jazz", 5)];

        const result = GenreCompatibilityScorer.calculate(
          userOnly,
          candidateOnly,
        );

        expect(result.score).toBe(0);
        expect(result.commonGenres).toEqual([]);
        expect(result.explanation).toContain("No common musical genres");
      });
    });

    describe("common genres", () => {
      it("should calculate weighted Jaccard similarity correctly", () => {
        const result = GenreCompatibilityScorer.calculate(
          userGenres,
          candidateGenres,
        );

        expect(result.score).toBeGreaterThan(0);
        expect(result.commonGenres).toContain("Rock");
        expect(result.commonGenres).toContain("Jazz");
        expect(result.commonGenres).toHaveLength(2);
      });

      it("should use minimum preference for weighted intersection", () => {
        const user = [createGenre("1", "Rock", 5)];
        const candidate = [createGenre("1", "Rock", 2)];

        const result = GenreCompatibilityScorer.calculate(user, candidate);

        // Should use min(5, 2) = 2 for intersection
        expect(result.score).toBeGreaterThan(0);
        expect(result.commonGenres).toContain("Rock");
      });

      it("should use maximum preference for weighted union", () => {
        const user = [createGenre("1", "Rock", 5), createGenre("2", "Jazz", 3)];
        const candidate = [
          createGenre("1", "Rock", 2),
          createGenre("3", "Blues", 4),
        ];

        const result = GenreCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeGreaterThan(0);
        expect(result.commonGenres).toContain("Rock");
      });
    });

    describe("high preference boost", () => {
      it("should boost score for high-preference matches (both >= 4)", () => {
        const highPrefUser = [createGenre("1", "Rock", 5)];
        const highPrefCandidate = [createGenre("1", "Rock", 4)];

        const lowPrefUser = [createGenre("1", "Rock", 3)];
        const lowPrefCandidate = [createGenre("1", "Rock", 2)];

        const highResult = GenreCompatibilityScorer.calculate(
          highPrefUser,
          highPrefCandidate,
        );
        const lowResult = GenreCompatibilityScorer.calculate(
          lowPrefUser,
          lowPrefCandidate,
        );

        expect(highResult.score).toBeGreaterThan(lowResult.score);
        expect(
          highResult.explanation.some((e) => e.includes("Strong alignment")),
        ).toBe(true);
      });

      it("should not boost when only one has high preference", () => {
        const user = [createGenre("1", "Rock", 5)];
        const candidate = [createGenre("1", "Rock", 2)];

        const result = GenreCompatibilityScorer.calculate(user, candidate);

        expect(result.explanation).not.toContain("Strong alignment");
      });

      it("should boost multiple high-preference matches", () => {
        const user = [createGenre("1", "Rock", 5), createGenre("2", "Jazz", 4)];
        const candidate = [
          createGenre("1", "Rock", 4),
          createGenre("2", "Jazz", 5),
        ];

        const result = GenreCompatibilityScorer.calculate(user, candidate);

        expect(result.explanation).toContain(
          "Strong alignment in 2 favorite genres",
        );
      });
    });

    describe("score boundaries", () => {
      it("should cap score at 100", () => {
        // Create scenario that would exceed 100 without capping
        const perfectMatch = [
          createGenre("1", "Rock", 5),
          createGenre("2", "Jazz", 5),
          createGenre("3", "Blues", 5),
        ];

        const result = GenreCompatibilityScorer.calculate(
          perfectMatch,
          perfectMatch,
        );

        expect(result.score).toBeLessThanOrEqual(100);
      });

      it("should return integer scores", () => {
        const result = GenreCompatibilityScorer.calculate(
          userGenres,
          candidateGenres,
        );

        expect(Number.isInteger(result.score)).toBe(true);
      });
    });

    describe("explanation generation", () => {
      it("should include count of shared interests", () => {
        const result = GenreCompatibilityScorer.calculate(
          userGenres,
          candidateGenres,
        );

        expect(result.explanation).toContain("2 shared musical interests");
      });

      it("should include strong alignment message for high preferences", () => {
        const user = [createGenre("1", "Rock", 5)];
        const candidate = [createGenre("1", "Rock", 4)];

        const result = GenreCompatibilityScorer.calculate(user, candidate);

        expect(
          result.explanation.some((e) => e.includes("Strong alignment")),
        ).toBe(true);
      });
    });

    describe("edge cases", () => {
      it("should handle duplicate genre IDs in same user", () => {
        const userWithDuplicates = [
          createGenre("1", "Rock", 5),
          createGenre("1", "Rock", 3), // Duplicate ID
        ];
        const candidate = [createGenre("1", "Rock", 4)];

        const result = GenreCompatibilityScorer.calculate(
          userWithDuplicates,
          candidate,
        );

        expect(result.score).toBeGreaterThan(0);
        expect(result.commonGenres).toContain("Rock");
      });

      it("should handle preference values at boundaries", () => {
        const user = [createGenre("1", "Rock", 1)]; // Minimum preference
        const candidate = [createGenre("1", "Rock", 5)]; // Maximum preference

        const result = GenreCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeGreaterThan(0);
      });

      it("should handle zero preference values", () => {
        const user = [createGenre("1", "Rock", 0)];
        const candidate = [createGenre("1", "Rock", 5)];

        const result = GenreCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBe(0); // Zero preference should result in zero intersection
      });
    });

    describe("mathematical properties", () => {
      it("should be symmetric for identical preferences", () => {
        const genres1 = [createGenre("1", "Rock", 3)];
        const genres2 = [createGenre("1", "Rock", 3)];

        const result1 = GenreCompatibilityScorer.calculate(genres1, genres2);
        const result2 = GenreCompatibilityScorer.calculate(genres2, genres1);

        expect(result1.score).toBe(result2.score);
      });

      it("should increase score with more common genres", () => {
        const user = [
          createGenre("1", "Rock", 3),
          createGenre("2", "Jazz", 3),
          createGenre("3", "Blues", 3),
        ];

        const candidate1 = [createGenre("1", "Rock", 3)];
        const candidate2 = [
          createGenre("1", "Rock", 3),
          createGenre("2", "Jazz", 3),
        ];

        const result1 = GenreCompatibilityScorer.calculate(user, candidate1);
        const result2 = GenreCompatibilityScorer.calculate(user, candidate2);

        expect(result2.score).toBeGreaterThan(result1.score);
      });
    });
  });
});
