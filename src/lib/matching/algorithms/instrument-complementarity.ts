import type { InstrumentSkill } from "../types/matching-types";

export class InstrumentCompatibilityScorer {
  // Define instrument relationships
  private static readonly COMPLEMENTARY_GROUPS = {
    rhythm: ["drums", "percussion", "bass"],
    harmony: ["guitar", "keyboard", "piano"],
    melody: ["vocals", "lead guitar", "violin", "saxophone", "trumpet"],
    support: ["bass", "rhythm guitar", "keyboard"],
  };

  private static readonly INSTRUMENT_ROLES = new Map([
    // Rhythm section
    ["drums", "rhythm"],
    ["percussion", "rhythm"],
    ["bass", "rhythm"],

    // Harmonic instruments
    ["guitar", "harmony"],
    ["electric guitar", "harmony"],
    ["acoustic guitar", "harmony"],
    ["keyboard", "harmony"],
    ["piano", "harmony"],

    // Melodic instruments
    ["vocals", "melody"],
    ["violin", "melody"],
    ["saxophone", "melody"],
    ["trumpet", "melody"],
    ["flute", "melody"],

    // Special cases
    ["lead guitar", "melody"],
    ["rhythm guitar", "support"],
  ]);

  static calculate(
    userInstruments: InstrumentSkill[],
    candidateInstruments: InstrumentSkill[],
  ): { score: number; complementarity: string[]; explanation: string[] } {
    if (userInstruments.length === 0 || candidateInstruments.length === 0) {
      return {
        score: 0,
        complementarity: [],
        explanation: ["No instruments specified"],
      };
    }

    // Get primary instruments (most experienced or marked as primary)
    const userPrimary = this.getPrimaryInstruments(userInstruments);
    const candidatePrimary = this.getPrimaryInstruments(candidateInstruments);

    // Check for exact overlaps (potential competition)
    const exactOverlaps = userPrimary.filter((ui) =>
      candidatePrimary.some(
        (ci) => ci.name.toLowerCase() === ui.name.toLowerCase(),
      ),
    );

    // Check for complementary roles
    const complementaryPairs = this.findComplementaryPairs(
      userPrimary,
      candidatePrimary,
    );

    // Calculate base score
    let score = 50; // Base compatibility

    // Bonus for complementary instruments
    score += complementaryPairs.length * 20;

    // Check for complete rhythm section
    if (this.hasRhythmSection([...userPrimary, ...candidatePrimary])) {
      score += 15;
    }

    // Check for harmonic balance
    if (this.hasHarmonicBalance([...userPrimary, ...candidatePrimary])) {
      score += 10;
    }

    // Penalty for too much overlap in same instruments
    score -= exactOverlaps.length * 15;

    // Skill level compatibility bonus
    const skillCompatibilityBonus = this.calculateSkillCompatibility(
      userInstruments,
      candidateInstruments,
    );
    score += skillCompatibilityBonus;

    // Cap score at 100
    score = Math.max(0, Math.min(100, score));

    // Generate explanations
    const explanation = [];
    if (complementaryPairs.length > 0) {
      explanation.push(
        `Great musical chemistry with ${complementaryPairs.length} complementary instruments`,
      );
    }
    if (exactOverlaps.length > 0) {
      explanation.push(
        `Some overlap in ${exactOverlaps.map((i) => i.name).join(", ")}`,
      );
    }
    if (this.hasRhythmSection([...userPrimary, ...candidatePrimary])) {
      explanation.push("Forms a solid rhythm section together");
    }

    return {
      score: Math.round(score),
      complementarity: complementaryPairs.map(
        (pair) => `${pair.user} complements ${pair.candidate}`,
      ),
      explanation,
    };
  }

  private static getPrimaryInstruments(
    instruments: InstrumentSkill[],
  ): InstrumentSkill[] {
    // Return instruments marked as primary, or top 2 by experience
    const primaryMarked = instruments.filter((i) => i.isPrimary);
    if (primaryMarked.length > 0) return primaryMarked;

    return instruments
      .sort((a, b) => b.yearsOfExperience - a.yearsOfExperience)
      .slice(0, 2);
  }

  private static findComplementaryPairs(
    userInstruments: InstrumentSkill[],
    candidateInstruments: InstrumentSkill[],
  ): Array<{ user: string; candidate: string }> {
    const pairs = [];

    for (const userInstrument of userInstruments) {
      for (const candidateInstrument of candidateInstruments) {
        if (
          this.areComplementary(userInstrument.name, candidateInstrument.name)
        ) {
          pairs.push({
            user: userInstrument.name,
            candidate: candidateInstrument.name,
          });
        }
      }
    }

    return pairs;
  }

  private static areComplementary(
    instrument1: string,
    instrument2: string,
  ): boolean {
    const role1 = this.INSTRUMENT_ROLES.get(instrument1.toLowerCase());
    const role2 = this.INSTRUMENT_ROLES.get(instrument2.toLowerCase());

    if (!role1 || !role2) return false;

    // Different roles are generally complementary
    if (role1 !== role2) return true;

    // Same role instruments can still be complementary in some cases
    // (e.g., lead guitar + rhythm guitar)
    const complementarySameRole = [
      ["lead guitar", "rhythm guitar"],
      ["vocals", "backing vocals"],
      ["keyboard", "piano"], // when used for different purposes
      ["drums", "bass"], // when used for different purposes
    ];

    return complementarySameRole.some(
      (pair) =>
        pair.includes(instrument1.toLowerCase()) &&
        pair.includes(instrument2.toLowerCase()),
    );
  }

  private static hasRhythmSection(allInstruments: InstrumentSkill[]): boolean {
    const instrumentNames = allInstruments.map((i) => i.name.toLowerCase());
    return (
      instrumentNames.includes("drums") && instrumentNames.includes("bass")
    );
  }

  private static hasHarmonicBalance(
    allInstruments: InstrumentSkill[],
  ): boolean {
    const roles = allInstruments
      .map((i) => this.INSTRUMENT_ROLES.get(i.name.toLowerCase()))
      .filter(Boolean);

    const uniqueRoles = new Set(roles);
    return uniqueRoles.size >= 2; // At least 2 different musical roles
  }

  private static calculateSkillCompatibility(
    userInstruments: InstrumentSkill[],
    candidateInstruments: InstrumentSkill[],
  ): number {
    const skillLevelMap = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };

    const userAvgSkill =
      userInstruments.reduce((sum, i) => sum + skillLevelMap[i.skillLevel], 0) /
      userInstruments.length;

    const candidateAvgSkill =
      candidateInstruments.reduce(
        (sum, i) => sum + skillLevelMap[i.skillLevel],
        0,
      ) / candidateInstruments.length;

    const skillDifference = Math.abs(userAvgSkill - candidateAvgSkill);

    // Bonus for similar skill levels (within 1 level)
    if (skillDifference <= 1) return 10;
    if (skillDifference <= 1.5) return 5;
    return 0;
  }
}
