import type { UserMatchProfile } from "./matching-types";

export interface ScoringWeights {
  location: number;
  genres: number;
  instruments: number;
  experience: number;
  activity: number;
}

export interface ScoringConfig {
  weights: ScoringWeights;
  locationDecayDistance: number; // km where location score starts to decay
  maxDistance: number; // km maximum search distance
  genreBoostMultiplier: number; // bonus for exact genre matches
  instrumentComplementBonus: number; // bonus for complementary instruments
  skillLevelTolerance: number; // acceptable skill level difference
}

export interface ScoreCalculationContext {
  currentUser: UserMatchProfile;
  candidate: UserMatchProfile;
  config: ScoringConfig;
}
