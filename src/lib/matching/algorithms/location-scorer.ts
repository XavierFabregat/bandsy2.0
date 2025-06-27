import type { Location } from "../types/matching-types";

export class LocationScorer {
  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(loc2.latitude - loc1.latitude);
    const dLon = this.toRadians(loc2.longitude - loc1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(loc1.latitude)) *
        Math.cos(this.toRadians(loc2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate location compatibility score
   * @param userLocation Current user's location
   * @param candidateLocation Candidate's location
   * @param maxDistance Maximum acceptable distance in km
   * @param optimalDistance Distance at which score starts to decay
   * @returns Score from 0-100
   */
  static calculate(
    userLocation: Location,
    candidateLocation: Location,
    maxDistance = 100,
    optimalDistance = 25,
  ): { score: number; distance: number } {
    const distance = this.calculateDistance(userLocation, candidateLocation);

    if (distance > maxDistance) {
      return { score: 0, distance };
    }

    if (distance <= optimalDistance) {
      return { score: 100, distance };
    }

    // Exponential decay after optimal distance
    const decayFactor =
      (distance - optimalDistance) / (maxDistance - optimalDistance);
    const score = Math.max(0, 100 * Math.exp(-2 * decayFactor));

    return { score: Math.round(score), distance };
  }
}
