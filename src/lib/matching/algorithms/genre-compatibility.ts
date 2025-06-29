import type { GenrePreference } from "../types/matching-types";

export class GenreCompatibilityScorer {
  /**
   * Calculate genre compatibility using weighted Jaccard similarity
   */
  static calculate(
    userGenres: GenrePreference[],
    candidateGenres: GenrePreference[],
  ): { score: number; commonGenres: string[]; explanation: string[] } {
    if (userGenres.length === 0 || candidateGenres.length === 0) {
      return {
        score: 0,
        commonGenres: [],
        explanation: ["No genre preferences set"],
      };
    }

    // Create maps for easier lookup
    const userGenreMap = new Map(userGenres.map((g) => [g.id, g.preference]));
    const candidateGenreMap = new Map(
      candidateGenres.map((g) => [g.id, g.preference]),
    );

    // Find common genres and calculate weighted intersection
    const commonGenreIds = [...userGenreMap.keys()].filter((id) =>
      candidateGenreMap.has(id),
    );

    if (commonGenreIds.length === 0) {
      return {
        score: 0,
        commonGenres: [],
        explanation: ["No common musical genres"],
      };
    }

    // Calculate weighted intersection
    const weightedIntersection = commonGenreIds.reduce((sum, genreId) => {
      const userPref = userGenreMap.get(genreId)!;
      const candidatePref = candidateGenreMap.get(genreId)!;
      // Use the minimum preference as the contribution
      return sum + Math.min(userPref, candidatePref);
    }, 0);

    // Calculate weighted union
    const allGenreIds = new Set([
      ...userGenreMap.keys(),
      ...candidateGenreMap.keys(),
    ]);

    const weightedUnion = [...allGenreIds].reduce((sum, genreId) => {
      const userPref = userGenreMap.get(genreId) ?? 0;
      const candidatePref = candidateGenreMap.get(genreId) ?? 0;
      return sum + Math.max(userPref, candidatePref);
    }, 0);

    // Calculate Jaccard similarity with preference weighting
    const jaccardScore = weightedIntersection / weightedUnion;

    // Boost score for high-preference matches
    const highPrefMatches = commonGenreIds.filter((id) => {
      const userPref = userGenreMap.get(id)!;
      const candidatePref = candidateGenreMap.get(id)!;
      return userPref >= 4 && candidatePref >= 4;
    });

    const boostMultiplier = 1 + highPrefMatches.length * 0.1;
    const finalScore = Math.min(100, jaccardScore * 100 * boostMultiplier);

    // Get genre names for explanation
    const commonGenres = commonGenreIds.map((id) => {
      const genre =
        userGenres.find((g) => g.id === id) ??
        candidateGenres.find((g) => g.id === id);
      return genre?.name ?? "Unknown";
    });

    const explanation = [
      `${commonGenres.length} shared musical interests`,
      ...(highPrefMatches.length > 0
        ? [`Strong alignment in ${highPrefMatches.length} favorite genres`]
        : []),
    ];

    return {
      score: Math.round(finalScore),
      commonGenres,
      explanation,
    };
  }
}
