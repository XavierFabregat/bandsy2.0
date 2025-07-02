import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  InstrumentSkill,
  Location,
} from "./matching/types/matching-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert skill level string to numeric value for calculations
 */
export function skillLevelToNumber(skillLevel: string): number {
  switch (skillLevel) {
    case "beginner":
      return 1;
    case "intermediate":
      return 2;
    case "advanced":
      return 3;
    case "expert":
    case "professional":
      return 4;
    default:
      return 2;
  }
}

/**
 * Calculate average skill level from instruments
 */
export function calculateSkillLevelAverage(
  instruments: InstrumentSkill[],
): number {
  if (instruments.length === 0) return 2;

  const total = instruments.reduce((sum, instrument) => {
    return sum + skillLevelToNumber(instrument.skillLevel);
  }, 0);

  return total / instruments.length;
}

/**
 * Calculate activity score based on last activity
 */
export function calculateActivityScore(lastActive: Date): number {
  const daysSinceActive = Math.floor(
    (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSinceActive <= 1) return 100;
  if (daysSinceActive <= 7) return 80;
  if (daysSinceActive <= 30) return 60;
  if (daysSinceActive <= 90) return 40;
  return 20;
}

/**
 * Get varied default location for testing (based on user ID)
 */
export function getTestLocation(userId: string): Location {
  const hash = userId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const locations = [
    { lat: 37.7749, lng: -122.4194, city: "San Francisco", region: "CA" },
    { lat: 37.8044, lng: -122.2712, city: "Oakland", region: "CA" },
    { lat: 40.7128, lng: -74.006, city: "New York", region: "NY" },
    { lat: 34.0522, lng: -118.2437, city: "Los Angeles", region: "CA" },
    { lat: 41.8781, lng: -87.6298, city: "Chicago", region: "IL" },
    { lat: 47.6062, lng: -122.3321, city: "Seattle", region: "WA" },
  ];

  const index = Math.abs(hash) % locations.length;
  const loc = locations[index]!;

  return {
    latitude: loc.lat,
    longitude: loc.lng,
    city: loc.city,
    region: loc.region,
    country: "United States",
  };
}
