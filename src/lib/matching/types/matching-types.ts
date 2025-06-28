import type { Sample } from "@/types/api";

export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

export interface ScoringConfig {
  weights: {
    location: number;
    genres: number;
    instruments: number;
    experience: number;
    activity: number;
  };
  locationDecayDistance: number;
  maxDistance: number;
  genreBoostMultiplier: number;
  instrumentComplementBonus: number;
  skillLevelTolerance: number;
}

export interface ScoreCalculationContext {
  currentUser: UserMatchProfile;
  candidate: UserMatchProfile;
  config: ScoringConfig;
}

export interface GenrePreference {
  id: string;
  name: string;
  preference: number; // 1-5 scale
  parentGenreId?: string;
}

export interface InstrumentSkill {
  id: string;
  name: string;
  category: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert";
  yearsOfExperience: number;
  isPrimary: boolean;
}

export interface UserMatchProfile {
  id: string;
  userId: string;
  location: Location;
  genres: GenrePreference[];
  instruments: InstrumentSkill[];
  skillLevelAverage: number;
  activityScore: number;
  lastActive: Date;
  isActive: boolean;
  searchRadius: number; // km
  ageRange: { min: number; max: number };
  lookingFor: "band" | "jam_session" | "collaboration" | "lessons" | "any";
  updatedAt: Date;
}

export interface MatchScore {
  overall: number; // 0-100
  factors: {
    location: number;
    genres: number;
    instruments: number;
    experience: number;
    activity: number;
  };
  explanation: string[];
  confidence: number; // 0-1, how confident we are in this score
}

export interface MatchCandidate {
  user: {
    id: string;
    username: string;
    displayName: string;
    profileImageUrl: string | null;
    bio: string | null;
    age: number | null;
    samples?: Sample[];
  };
  profile: UserMatchProfile;
  score: MatchScore;
  distance: number; // km
  lastActive: Date;
}

export interface DiscoveryFilters {
  maxDistance?: number;
  instruments?: string[];
  genres?: string[];
  skillLevel?: string[];
  lookingFor?: string[];
  ageRange?: { min: number; max: number };
  isActive?: boolean; // active in last X days
}

export interface PaginationOptions {
  page: number;
  limit: number;
  cursor?: string;
}
