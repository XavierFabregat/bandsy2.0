import type {
  UserMatchProfile,
  MatchScore,
  ScoringConfig,
  ScoreCalculationContext,
} from "../types/matching-types";
import { LocationScorer } from "./location-scorer";
import { GenreCompatibilityScorer } from "./genre-compatibility";
import { InstrumentCompatibilityScorer } from "./instrument-complementarity";

export class CompositeScorer {
  private static readonly DEFAULT_CONFIG: ScoringConfig = {
    weights: {
      location: 0.25,
      genres: 0.3,
      instruments: 0.25,
      experience: 0.1,
      activity: 0.1,
    },
    locationDecayDistance: 25,
    maxDistance: 100,
    genreBoostMultiplier: 1.2,
    instrumentComplementBonus: 15,
    skillLevelTolerance: 1,
  };

  static calculate(
    currentUser: UserMatchProfile,
    candidate: UserMatchProfile,
    config: ScoringConfig = this.DEFAULT_CONFIG,
  ): MatchScore {
    const context: ScoreCalculationContext = {
      currentUser,
      candidate,
      config,
    };

    // Calculate individual factor scores
    const locationResult = LocationScorer.calculate(
      currentUser.location,
      candidate.location,
      config.maxDistance,
      config.locationDecayDistance,
    );

    const genreResult = GenreCompatibilityScorer.calculate(
      currentUser.genres,
      candidate.genres,
    );

    const instrumentResult = InstrumentCompatibilityScorer.calculate(
      currentUser.instruments,
      candidate.instruments,
    );

    const experienceScore = this.calculateExperienceCompatibility(context);
    const activityScore = this.calculateActivityScore(context);

    // Combine scores using weighted average
    const factors = {
      location: locationResult.score,
      genres: genreResult.score,
      instruments: instrumentResult.score,
      experience: experienceScore,
      activity: activityScore,
    };

    const overallScore =
      factors.location * config.weights.location +
      factors.genres * config.weights.genres +
      factors.instruments * config.weights.instruments +
      factors.experience * config.weights.experience +
      factors.activity * config.weights.activity;

    // Calculate confidence based on data completeness
    const confidence = this.calculateConfidence(currentUser, candidate);

    // Generate explanation
    const explanation = [
      ...(locationResult.distance <= config.locationDecayDistance
        ? [`Close proximity (${Math.round(locationResult.distance)}km away)`]
        : [`${Math.round(locationResult.distance)}km away`]),
      ...genreResult.explanation,
      ...instrumentResult.explanation,
    ];

    return {
      overall: Math.round(overallScore),
      factors,
      explanation,
      confidence,
    };
  }

  private static calculateExperienceCompatibility(
    context: ScoreCalculationContext,
  ): number {
    const { currentUser, candidate, config } = context;

    const userAvgSkill = currentUser.skillLevelAverage;
    const candidateAvgSkill = candidate.skillLevelAverage;

    const skillDifference = Math.abs(userAvgSkill - candidateAvgSkill);

    if (skillDifference <= config.skillLevelTolerance) return 100;
    if (skillDifference <= config.skillLevelTolerance * 1.5) return 75;
    if (skillDifference <= config.skillLevelTolerance * 2) return 50;
    return 25;
  }

  private static calculateActivityScore(
    context: ScoreCalculationContext,
  ): number {
    const { candidate } = context;

    const daysSinceActive = Math.floor(
      (Date.now() - candidate.lastActive.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceActive <= 1) return 100;
    if (daysSinceActive <= 7) return 80;
    if (daysSinceActive <= 30) return 60;
    return 30;
  }

  private static calculateConfidence(
    currentUser: UserMatchProfile,
    candidate: UserMatchProfile,
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on profile completeness
    if (currentUser.genres.length >= 3 && candidate.genres.length >= 3) {
      confidence += 0.2;
    }

    if (
      currentUser.instruments.length >= 1 &&
      candidate.instruments.length >= 1
    ) {
      confidence += 0.2;
    }

    if (currentUser.location && candidate.location) {
      confidence += 0.1;
    }

    return Math.min(1, confidence);
  }
}
