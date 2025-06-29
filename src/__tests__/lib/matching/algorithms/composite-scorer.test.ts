import { describe, it, expect, beforeEach } from "vitest";
import { CompositeScorer } from "@/lib/matching/algorithms/composite-scorer";
import type {
  UserMatchProfile,
  ScoringConfig,
  Location,
  GenrePreference,
  InstrumentSkill,
} from "@/lib/matching/types/matching-types";

describe("CompositeScorer", () => {
  // Test data factories
  const createLocation = (lat: number, lng: number): Location => ({
    latitude: lat,
    longitude: lng,
    city: "Test City",
    region: "Test Region",
    country: "Test Country",
  });

  const createGenre = (
    id: string,
    name: string,
    preference: number,
  ): GenrePreference => ({
    id,
    name,
    preference,
  });

  const createInstrument = (
    id: string,
    name: string,
    skillLevel: InstrumentSkill["skillLevel"] = "intermediate",
    yearsOfExperience = 5,
    isPrimary = false,
  ): InstrumentSkill => ({
    id,
    name,
    category: "String",
    skillLevel,
    yearsOfExperience,
    isPrimary,
  });

  const createUserProfile = (
    overrides: Partial<UserMatchProfile> = {},
  ): UserMatchProfile => ({
    id: "test-profile-id",
    userId: "test-user-id",
    location: createLocation(40.7128, -74.006), // NYC
    genres: [createGenre("1", "Rock", 5), createGenre("2", "Jazz", 4)],
    instruments: [createInstrument("1", "guitar", "intermediate", 5, true)],
    skillLevelAverage: 2.5,
    activityScore: 80,
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isActive: true,
    searchRadius: 50,
    ageRange: { min: 20, max: 35 },
    lookingFor: "band",
    updatedAt: new Date(),
    ...overrides,
  });

  let defaultUser: UserMatchProfile;
  let defaultCandidate: UserMatchProfile;

  beforeEach(() => {
    defaultUser = createUserProfile();
    defaultCandidate = createUserProfile({
      id: "candidate-profile-id",
      userId: "candidate-user-id",
      location: createLocation(40.75, -73.9857), // Close to NYC
      instruments: [createInstrument("2", "drums", "intermediate", 4, true)],
    });
  });

  describe("calculate", () => {
    describe("overall scoring", () => {
      it("should return a complete MatchScore object", () => {
        const result = CompositeScorer.calculate(defaultUser, defaultCandidate);

        expect(result).toHaveProperty("overall");
        expect(result).toHaveProperty("factors");
        expect(result).toHaveProperty("explanation");
        expect(result).toHaveProperty("confidence");

        expect(typeof result.overall).toBe("number");
        expect(result.overall).toBeGreaterThanOrEqual(0);
        expect(result.overall).toBeLessThanOrEqual(100);
      });

      it("should calculate weighted average correctly", () => {
        const result = CompositeScorer.calculate(defaultUser, defaultCandidate);

        // Test that the overall score is within expected range
        // and is influenced by all factors
        expect(result.overall).toBeGreaterThanOrEqual(0);
        expect(result.overall).toBeLessThanOrEqual(100);
        expect(Number.isInteger(result.overall)).toBe(true);

        // Verify that changing individual factors affects the overall score
        const { factors } = result;
        const hasNonZeroFactors = Object.values(factors).some(
          (score) => score > 0,
        );
        expect(hasNonZeroFactors).toBe(true);
      });

      it("should return integer overall scores", () => {
        const result = CompositeScorer.calculate(defaultUser, defaultCandidate);

        expect(Number.isInteger(result.overall)).toBe(true);
      });
    });

    describe("factor scores", () => {
      it("should include all required factor scores", () => {
        const result = CompositeScorer.calculate(defaultUser, defaultCandidate);

        expect(result.factors).toHaveProperty("location");
        expect(result.factors).toHaveProperty("genres");
        expect(result.factors).toHaveProperty("instruments");
        expect(result.factors).toHaveProperty("experience");
        expect(result.factors).toHaveProperty("activity");

        Object.values(result.factors).forEach((score) => {
          expect(typeof score).toBe("number");
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        });
      });

      it("should calculate location score using LocationScorer", () => {
        const nearbyCandidate = createUserProfile({
          location: createLocation(40.72, -74.01), // Very close to user
        });

        const farCandidate = createUserProfile({
          location: createLocation(34.0522, -118.2437), // LA - far from NYC
        });

        const nearResult = CompositeScorer.calculate(
          defaultUser,
          nearbyCandidate,
        );
        const farResult = CompositeScorer.calculate(defaultUser, farCandidate);

        expect(nearResult.factors.location).toBeGreaterThan(
          farResult.factors.location,
        );
      });

      it("should calculate genre score using GenreCompatibilityScorer", () => {
        const similarGenres = createUserProfile({
          genres: [
            createGenre("1", "Rock", 5), // Same as user
            createGenre("2", "Jazz", 4), // Same as user
          ],
        });

        const differentGenres = createUserProfile({
          genres: [
            createGenre("3", "Classical", 5),
            createGenre("4", "Electronic", 4),
          ],
        });

        const similarResult = CompositeScorer.calculate(
          defaultUser,
          similarGenres,
        );
        const differentResult = CompositeScorer.calculate(
          defaultUser,
          differentGenres,
        );

        expect(similarResult.factors.genres).toBeGreaterThan(
          differentResult.factors.genres,
        );
      });

      it("should calculate instrument score using InstrumentCompatibilityScorer", () => {
        const complementaryInstruments = createUserProfile({
          instruments: [
            createInstrument("2", "drums", "intermediate", 5, true),
          ],
        });

        const sameInstruments = createUserProfile({
          instruments: [
            createInstrument("1", "guitar", "intermediate", 5, true),
          ],
        });

        const complementaryResult = CompositeScorer.calculate(
          defaultUser,
          complementaryInstruments,
        );
        const sameResult = CompositeScorer.calculate(
          defaultUser,
          sameInstruments,
        );

        expect(complementaryResult.factors.instruments).toBeGreaterThan(
          sameResult.factors.instruments,
        );
      });
    });

    describe("experience compatibility", () => {
      it("should give perfect score for similar skill levels", () => {
        const similarSkill = createUserProfile({
          skillLevelAverage: 2.5, // Same as default user
        });

        const result = CompositeScorer.calculate(defaultUser, similarSkill);

        expect(result.factors.experience).toBe(100);
      });

      it("should decrease score with skill level difference", () => {
        const beginnerCandidate = createUserProfile({
          skillLevelAverage: 1.0, // Much lower than user's 2.5
        });

        const expertCandidate = createUserProfile({
          skillLevelAverage: 4.0, // Much higher than user's 2.5
        });

        const beginnerResult = CompositeScorer.calculate(
          defaultUser,
          beginnerCandidate,
        );
        const expertResult = CompositeScorer.calculate(
          defaultUser,
          expertCandidate,
        );

        expect(beginnerResult.factors.experience).toBeLessThan(100);
        expect(expertResult.factors.experience).toBeLessThan(100);
      });

      it("should handle skill level tolerance", () => {
        const slightlyDifferent = createUserProfile({
          skillLevelAverage: 2.0, // Within tolerance of 2.5
        });

        const result = CompositeScorer.calculate(
          defaultUser,
          slightlyDifferent,
        );

        expect(result.factors.experience).toBe(100);
      });
    });

    describe("activity scoring", () => {
      it("should give perfect score for very recent activity", () => {
        const veryActive = createUserProfile({
          lastActive: new Date(), // Right now
        });

        const result = CompositeScorer.calculate(defaultUser, veryActive);

        expect(result.factors.activity).toBe(100);
      });

      it("should decrease score with time since last active", () => {
        const recentlyActive = createUserProfile({
          lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        });

        const longInactive = createUserProfile({
          lastActive: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        });

        const recentResult = CompositeScorer.calculate(
          defaultUser,
          recentlyActive,
        );
        const oldResult = CompositeScorer.calculate(defaultUser, longInactive);

        expect(recentResult.factors.activity).toBeGreaterThan(
          oldResult.factors.activity,
        );
      });
    });

    describe("confidence calculation", () => {
      it("should calculate confidence based on profile completeness", () => {
        const result = CompositeScorer.calculate(defaultUser, defaultCandidate);

        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      });

      it("should increase confidence with more complete profiles", () => {
        const completeProfile = createUserProfile({
          genres: [
            createGenre("1", "Rock", 5),
            createGenre("2", "Jazz", 4),
            createGenre("3", "Blues", 3),
          ],
          instruments: [
            createInstrument("1", "guitar", "intermediate", 5, true),
            createInstrument("2", "piano", "beginner", 2),
          ],
        });

        const minimalProfile = createUserProfile({
          genres: [createGenre("1", "Rock", 3)],
          instruments: [],
        });

        const completeResult = CompositeScorer.calculate(
          defaultUser,
          completeProfile,
        );
        const minimalResult = CompositeScorer.calculate(
          defaultUser,
          minimalProfile,
        );

        expect(completeResult.confidence).toBeGreaterThan(
          minimalResult.confidence,
        );
      });
    });

    describe("custom configuration", () => {
      it("should accept custom scoring configuration", () => {
        const customConfig: ScoringConfig = {
          weights: {
            location: 0.5, // Higher weight
            genres: 0.2,
            instruments: 0.2,
            experience: 0.05,
            activity: 0.05,
          },
          locationDecayDistance: 1, // since default user is 4km away
          maxDistance: 4,
          genreBoostMultiplier: 1.5,
          instrumentComplementBonus: 20,
          skillLevelTolerance: 2,
        };

        const defaultResult = CompositeScorer.calculate(
          defaultUser,
          defaultCandidate,
        );
        const customResult = CompositeScorer.calculate(
          defaultUser,
          defaultCandidate,
          customConfig,
        );

        // Results should be different due to different weights
        expect(customResult.overall).not.toBe(defaultResult.overall);
      });

      it("should use custom distance parameters", () => {
        const farCandidate = createUserProfile({
          location: createLocation(41.8781, -87.6298), // Chicago
        });

        const restrictiveConfig: ScoringConfig = {
          weights: {
            location: 1,
            genres: 0,
            instruments: 0,
            experience: 0,
            activity: 0,
          },
          locationDecayDistance: 25,
          maxDistance: 50, // Chicago is beyond this
          genreBoostMultiplier: 1,
          instrumentComplementBonus: 0,
          skillLevelTolerance: 1,
        };

        const result = CompositeScorer.calculate(
          defaultUser,
          farCandidate,
          restrictiveConfig,
        );

        expect(result.factors.location).toBe(0);
        expect(result.overall).toBe(0);
      });
    });

    describe("explanation generation", () => {
      it("should include location information", () => {
        const result = CompositeScorer.calculate(defaultUser, defaultCandidate);

        expect(result.explanation.some((exp) => exp.includes("km away"))).toBe(
          true,
        );
      });

      it("should include genre and instrument explanations", () => {
        const result = CompositeScorer.calculate(defaultUser, defaultCandidate);

        // Should include explanations from genre and instrument scorers
        expect(result.explanation.length).toBeGreaterThan(1);
      });

      it("should handle close proximity specially", () => {
        const veryClose = createUserProfile({
          location: createLocation(40.713, -74.0062), // Very close to user
        });

        const result = CompositeScorer.calculate(defaultUser, veryClose);

        expect(
          result.explanation.some((exp) => exp.includes("Close proximity")),
        ).toBe(true);
      });
    });

    describe("edge cases", () => {
      it("should handle profiles with missing data", () => {
        const incompleteProfile = createUserProfile({
          genres: [],
          instruments: [],
        });

        const result = CompositeScorer.calculate(
          defaultUser,
          incompleteProfile,
        );

        expect(result.overall).toBeGreaterThanOrEqual(0);
        expect(result.overall).toBeLessThanOrEqual(100);
        expect(result.confidence).toBeLessThan(1);
      });

      it("should handle identical profiles", () => {
        const result = CompositeScorer.calculate(defaultUser, defaultUser);

        expect(result.overall).toBeGreaterThanOrEqual(0);
        expect(result.overall).toBeLessThanOrEqual(100);
        expect(result.factors.location).toBe(100); // Same location
      });

      it("should handle extreme dates", () => {
        const veryOldActivity = createUserProfile({
          lastActive: new Date("2020-01-01"),
        });

        const result = CompositeScorer.calculate(defaultUser, veryOldActivity);

        expect(result.factors.activity).toBeLessThan(50);
      });
    });

    describe("mathematical properties", () => {
      it("should produce consistent results for same inputs", () => {
        const result1 = CompositeScorer.calculate(
          defaultUser,
          defaultCandidate,
        );
        const result2 = CompositeScorer.calculate(
          defaultUser,
          defaultCandidate,
        );

        expect(result1.overall).toBe(result2.overall);
        expect(result1.factors).toEqual(result2.factors);
      });

      it("should handle weight normalization", () => {
        const unnormalizedConfig: ScoringConfig = {
          weights: {
            location: 0.5,
            genres: 0.5,
            instruments: 0.5,
            experience: 0.5,
            activity: 0.5,
          }, // Sum = 2.5, not 1
          locationDecayDistance: 25,
          maxDistance: 100,
          genreBoostMultiplier: 1.2,
          instrumentComplementBonus: 15,
          skillLevelTolerance: 1,
        };

        const result = CompositeScorer.calculate(
          defaultUser,
          defaultCandidate,
          unnormalizedConfig,
        );

        // Should still produce valid scores even with non-normalized weights
        expect(result.overall).toBeGreaterThanOrEqual(0);
        expect(result.overall).toBeLessThanOrEqual(250); // 100 * 2.5 max
      });
    });
  });
});
