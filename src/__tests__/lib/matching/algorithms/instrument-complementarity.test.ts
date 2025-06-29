import { describe, it, expect } from "vitest";
import { InstrumentCompatibilityScorer } from "@/lib/matching/algorithms/instrument-complementarity";
import type { InstrumentSkill } from "@/lib/matching/types/matching-types";

describe("InstrumentCompatibilityScorer", () => {
  // Test data factory
  const createInstrument = (
    name: string,
    skillLevel: InstrumentSkill["skillLevel"] = "intermediate",
    yearsOfExperience = 5,
    isPrimary = false,
  ): InstrumentSkill => ({
    id: name.toLowerCase().replace(" ", "-"),
    name,
    category: "String", // Default category
    skillLevel,
    yearsOfExperience,
    isPrimary,
  });

  describe("calculate", () => {
    describe("empty inputs", () => {
      it("should return zero score when user has no instruments", () => {
        const candidate = [createInstrument("Guitar")];
        const result = InstrumentCompatibilityScorer.calculate([], candidate);

        expect(result.score).toBe(0);
        expect(result.complementarity).toEqual([]);
        expect(result.explanation).toContain("No instruments specified");
      });

      it("should return zero score when candidate has no instruments", () => {
        const user = [createInstrument("Drums")];
        const result = InstrumentCompatibilityScorer.calculate(user, []);

        expect(result.score).toBe(0);
        expect(result.complementarity).toEqual([]);
        expect(result.explanation).toContain("No instruments specified");
      });
    });

    describe("complementary instruments", () => {
      it("should give high score for rhythm section (drums + bass)", () => {
        const user = [createInstrument("drums", "intermediate", 5, true)];
        const candidate = [createInstrument("bass", "intermediate", 5, true)];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeGreaterThan(70);
        expect(result.explanation).toContain(
          "Forms a solid rhythm section together",
        );
      });

      it("should identify complementary pairs", () => {
        const user = [createInstrument("guitar")];
        const candidate = [createInstrument("drums")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeGreaterThan(50);
        expect(result.complementarity).toContain("guitar complements drums");
      });

      it("should bonus for multiple complementary pairs", () => {
        const user = [createInstrument("guitar"), createInstrument("vocals")];
        const candidate = [createInstrument("drums"), createInstrument("bass")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeGreaterThan(80);
        expect(result.complementarity.length).toBeGreaterThan(1);
      });
    });

    describe("instrument overlap", () => {
      it("should penalize exact instrument overlaps", () => {
        const user = [createInstrument("guitar")];
        const candidate = [createInstrument("guitar")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeLessThan(50);
        expect(result.explanation).toContain("Some overlap in guitar");
      });

      it("should handle multiple overlaps", () => {
        const user = [createInstrument("guitar"), createInstrument("piano")];
        const candidate = [
          createInstrument("guitar"),
          createInstrument("piano"),
        ];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeLessThanOrEqual(50);
        expect(result.explanation).toContain("Some overlap in guitar, piano");
      });
    });

    describe("primary instrument selection", () => {
      it("should prioritize instruments marked as primary", () => {
        const user = [
          createInstrument("guitar", "beginner", 1, false),
          createInstrument("drums", "expert", 10, true),
        ];
        const candidate = [createInstrument("bass")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        // Should use drums (primary) not guitar (more experienced but not primary)
        expect(result.complementarity).toContain("drums complements bass");
      });

      it("should use most experienced instruments when none marked primary", () => {
        const user = [
          createInstrument("guitar", "beginner", 1),
          createInstrument("drums", "expert", 10),
          createInstrument("piano", "intermediate", 5),
        ];
        const candidate = [createInstrument("bass")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        // Should use top 2 by experience: drums (10 years) and piano (5 years)
        expect(result.complementarity.some((c) => c.includes("drums"))).toBe(
          true,
        );
      });
    });

    describe("skill level compatibility", () => {
      it("should bonus for similar skill levels", () => {
        const user = [createInstrument("guitar", "intermediate")];
        const candidate1 = [createInstrument("drums", "intermediate")]; // Same level
        const candidate2 = [createInstrument("drums", "expert")]; // Different level

        const result1 = InstrumentCompatibilityScorer.calculate(
          user,
          candidate1,
        );
        const result2 = InstrumentCompatibilityScorer.calculate(
          user,
          candidate2,
        );

        expect(result1.score).toBeGreaterThan(result2.score);
      });

      it("should handle all skill levels", () => {
        const skillLevels: InstrumentSkill["skillLevel"][] = [
          "beginner",
          "intermediate",
          "advanced",
          "expert",
        ];

        skillLevels.forEach((level) => {
          const user = [createInstrument("guitar", level)];
          const candidate = [createInstrument("drums", level)];

          const result = InstrumentCompatibilityScorer.calculate(
            user,
            candidate,
          );
          expect(result.score).toBeGreaterThan(0);
        });
      });
    });

    describe("musical role analysis", () => {
      it("should recognize rhythm section formation", () => {
        const user = [createInstrument("drums")];
        const candidate = [createInstrument("bass")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.explanation).toContain(
          "Forms a solid rhythm section together",
        );
      });

      it("should recognize harmonic balance", () => {
        const user = [createInstrument("guitar")]; // Harmony
        const candidate = [createInstrument("drums")]; // Rhythm

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeGreaterThan(50); // Should get harmonic balance bonus
      });

      it("should handle same-role complementary instruments", () => {
        const user = [createInstrument("lead guitar")];
        const candidate = [createInstrument("rhythm guitar")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeGreaterThan(50);
        expect(result.complementarity).toContain(
          "lead guitar complements rhythm guitar",
        );
      });
    });

    describe("score calculation", () => {
      it("should start with base score of 50", () => {
        const user = [createInstrument("unknown-instrument", "beginner")];
        const candidate = [createInstrument("another-unknown", "expert")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        // Should be close to base score with no bonuses/penalties
        expect(result.score).toBeCloseTo(50, 0);
      });

      it("should cap score at 100", () => {
        // Create scenario with maximum bonuses
        const user = [
          createInstrument("drums", "expert", 10, true),
          createInstrument("vocals", "expert", 10, true),
        ];
        const candidate = [
          createInstrument("bass", "expert", 10, true),
          createInstrument("guitar", "expert", 10, true),
        ];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeLessThanOrEqual(100);
      });

      it("should not go below 0", () => {
        // Create scenario with maximum penalties
        const overlappingInstruments = [
          createInstrument("guitar"),
          createInstrument("piano"),
          createInstrument("drums"),
          createInstrument("bass"),
        ];

        const result = InstrumentCompatibilityScorer.calculate(
          overlappingInstruments,
          overlappingInstruments,
        );

        expect(result.score).toBeGreaterThanOrEqual(0);
      });

      it("should return integer scores", () => {
        const user = [createInstrument("guitar")];
        const candidate = [createInstrument("drums")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(Number.isInteger(result.score)).toBe(true);
      });
    });

    describe("edge cases", () => {
      it("should handle case-insensitive instrument matching", () => {
        const user = [createInstrument("GUITAR")];
        const candidate = [createInstrument("guitar")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.explanation).toContain("Some overlap in GUITAR");
      });

      it("should handle instruments not in role mapping", () => {
        const user = [createInstrument("didgeridoo")];
        const candidate = [createInstrument("kazoo")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      });

      it("should handle empty instrument names", () => {
        const user = [createInstrument("")];
        const candidate = [createInstrument("guitar")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.score).toBeGreaterThanOrEqual(0);
      });
    });

    describe("explanation generation", () => {
      it("should provide clear explanations for high scores", () => {
        const user = [createInstrument("drums")];
        const candidate = [createInstrument("bass")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.explanation.length).toBeGreaterThan(0);
        expect(result.explanation.join(" ")).toContain("complementary");
      });

      it("should explain overlaps clearly", () => {
        const user = [createInstrument("guitar")];
        const candidate = [createInstrument("guitar")];

        const result = InstrumentCompatibilityScorer.calculate(user, candidate);

        expect(result.explanation.some((e) => e.includes("overlap"))).toBe(
          true,
        );
      });
    });

    describe("real-world scenarios", () => {
      it("should score typical rock band formation highly", () => {
        const guitarist = [createInstrument("guitar", "intermediate", 5, true)];
        const drummer = [createInstrument("drums", "intermediate", 4, true)];

        const result = InstrumentCompatibilityScorer.calculate(
          guitarist,
          drummer,
        );

        expect(result.score).toBeGreaterThan(65);
      });

      it("should handle multi-instrumentalists", () => {
        const multiUser = [
          createInstrument("guitar", "advanced", 8, true),
          createInstrument("piano", "intermediate", 3),
          createInstrument("vocals", "intermediate", 5),
        ];
        const specialist = [createInstrument("drums", "expert", 10, true)];

        const result = InstrumentCompatibilityScorer.calculate(
          multiUser,
          specialist,
        );

        expect(result.score).toBeGreaterThan(60);
        expect(result.complementarity.length).toBeGreaterThan(0);
      });
    });
  });
});
