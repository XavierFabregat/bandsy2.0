import { describe, it, expect } from "vitest";
import { LocationScorer } from "@/lib/matching/algorithms/location-scorer";
import type { Location } from "@/lib/matching/types/matching-types";

describe("LocationScorer", () => {
  // Test locations - using real coordinates for accuracy
  const testLocations = {
    // New York City
    nyc: { latitude: 40.7128, longitude: -74.006 } as Location,

    // Los Angeles
    la: { latitude: 34.0522, longitude: -118.2437 } as Location,

    // Chicago (closer to NYC)
    chicago: { latitude: 41.8781, longitude: -87.6298 } as Location,

    // Brooklyn (very close to NYC)
    brooklyn: { latitude: 40.6782, longitude: -73.9442 } as Location,

    // Same location
    nycDuplicate: { latitude: 40.7128, longitude: -74.006 } as Location,

    // London (international)
    london: { latitude: 51.5074, longitude: -0.1278 } as Location,

    // San Francisco (west coast)
    sf: { latitude: 37.7749, longitude: -122.4194 } as Location,

    // Philadelphia
    philly: { latitude: 39.9526, longitude: -75.1652 } as Location,

    // Newark, 14km from NYC
    newark: { latitude: 40.7357, longitude: -74.1724 } as Location,

    // lat and long 28km from NYC
    midDistance: { latitude: 40.5128, longitude: -73.8026 } as Location,

    // lat and long 58km from NYC
    farDistance: { latitude: 40.2128, longitude: -73.8026 } as Location,
  };

  describe("calculate", () => {
    describe("same location", () => {
      it("should return perfect score for identical coordinates", () => {
        const result = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.nycDuplicate,
        );

        expect(result.score).toBe(100);
        expect(result.distance).toBe(0);
      });
    });

    describe("within optimal distance", () => {
      it("should return perfect score for locations within optimal distance (25km default)", () => {
        const result = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.brooklyn,
        );

        expect(result.score).toBe(100);
        expect(result.distance).toBeLessThan(25);
        expect(result.distance).toBeGreaterThan(0);
      });
    });

    describe("beyond optimal distance but within max distance", () => {
      it("should return decreasing score with exponential decay", () => {
        const result = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.midDistance,
        );

        expect(result.score).toBeLessThan(100);
        expect(result.score).toBeGreaterThan(0);
        expect(result.distance).toBeGreaterThan(25);
        expect(result.distance).toBeLessThan(100);
      });

      it("should return lower score for greater distances", () => {
        const midDistanceResult = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.midDistance,
        );
        const farDistanceResult = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.farDistance,
        );

        expect(farDistanceResult.score).toBeLessThan(midDistanceResult.score);
        expect(farDistanceResult.distance).toBeGreaterThan(
          midDistanceResult.distance,
        );
      });
    });

    describe("beyond max distance", () => {
      it("should return zero score for locations beyond max distance (100km default)", () => {
        const result = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.la,
        );

        expect(result.score).toBe(0);
        expect(result.distance).toBeGreaterThan(100);
      });

      it("should return zero score for international locations", () => {
        const result = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.london,
        );

        expect(result.score).toBe(0);
        expect(result.distance).toBeGreaterThan(100);
      });
    });

    describe("custom distance parameters", () => {
      it("should respect custom maxDistance parameter", () => {
        const customMaxDistance = 50;
        const result = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.chicago,
          customMaxDistance,
        );

        expect(result.score).toBe(0);
        expect(result.distance).toBeGreaterThan(customMaxDistance);
      });

      it("should respect custom optimalDistance parameter", () => {
        const customOptimalDistance = 50;
        const customMaxDistance = 200;

        const result = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.midDistance, // 28km from NYC -- outside of hardcoded optimal distance inside customOptimalDistance
          customMaxDistance,
          customOptimalDistance,
        );

        expect(result.score).toBe(100);
        expect(result.distance).toBeLessThan(customOptimalDistance);
      });

      it("should handle edge case where optimalDistance equals maxDistance", () => {
        const distance = 50;
        const result = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.chicago,
          distance, // maxDistance
          distance, // optimalDistance
        );

        // Should return 0 since distance > both optimal and max
        expect(result.score).toBe(0);
      });
    });

    describe("score calculation accuracy", () => {
      it("should return consistent scores for same distance", () => {
        // Create two locations equidistant from NYC
        const location1: Location = { latitude: 40.8128, longitude: -74.006 };
        const location2: Location = { latitude: 40.6128, longitude: -74.006 };

        const result1 = LocationScorer.calculate(testLocations.nyc, location1);
        const result2 = LocationScorer.calculate(testLocations.nyc, location2);

        // Distances should be approximately equal (within 1km tolerance)
        expect(Math.abs(result1.distance - result2.distance)).toBeLessThan(1);
        // Scores should be equal for equal distances
        expect(result1.score).toBe(result2.score);
      });

      it("should return integer scores", () => {
        const result = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.chicago,
        );

        expect(Number.isInteger(result.score)).toBe(true);
      });

      it("should return precise distance calculations", () => {
        const result = LocationScorer.calculate(
          testLocations.nyc,
          testLocations.la,
        );

        // NYC to LA is approximately 3944 km
        expect(result.distance).toBeGreaterThan(3900);
        expect(result.distance).toBeLessThan(4000);
      });
    });

    describe("boundary conditions", () => {
      it("should handle locations at exactly optimal distance", () => {
        // Create a location exactly 25km from NYC
        const exactOptimalLocation: Location = {
          latitude: 40.9384, // approximately 25km north of NYC
          longitude: -74.006,
        };

        const result = LocationScorer.calculate(
          testLocations.nyc,
          exactOptimalLocation,
        );

        expect(result.distance).toBeCloseTo(25, 0);
        expect(result.score).toBe(100);
      });

      it("should handle locations at exactly max distance", () => {
        // Create a location exactly 100km from NYC
        const exactMaxLocation: Location = {
          latitude: 41.6128, // approximately 100km north of NYC
          longitude: -74.006,
        };

        const result = LocationScorer.calculate(
          testLocations.nyc,
          exactMaxLocation,
        );

        expect(result.distance).toBeCloseTo(100, 0);
        expect(result.score).toBe(0);
      });
    });

    describe("edge cases", () => {
      it("should handle extreme coordinates", () => {
        const northPole: Location = { latitude: 90, longitude: 0 };
        const southPole: Location = { latitude: -90, longitude: 0 };

        const result = LocationScorer.calculate(northPole, southPole);

        expect(result.distance).toBeGreaterThan(19000); // Approximately half Earth's circumference
        expect(result.score).toBe(0);
      });

      it("should handle locations on the antimeridian", () => {
        const eastSide: Location = { latitude: 0, longitude: 179 };
        const westSide: Location = { latitude: 0, longitude: -179 };

        const result = LocationScorer.calculate(eastSide, westSide);

        // Should calculate the shorter distance across the antimeridian
        expect(result.distance).toBeLessThan(1000); // Much less than going the long way
        expect(result.score).toBe(0); // Still beyond max distance
      });
    });

    describe("performance characteristics", () => {
      it("should handle multiple calculations efficiently", () => {
        const startTime = performance.now();

        // Perform 1000 calculations
        for (let i = 0; i < 1000; i++) {
          LocationScorer.calculate(testLocations.nyc, testLocations.la);
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Should complete 1000 calculations in under 100ms
        expect(duration).toBeLessThan(100);
      });
    });
  });

  describe("distance calculation accuracy", () => {
    it("should calculate known distances accurately", () => {
      // Known distance: NYC to LA is approximately 3944 km
      const result = LocationScorer.calculate(
        testLocations.nyc,
        testLocations.la,
      );
      expect(result.distance).toBeCloseTo(3944, -2); // Within 100km tolerance

      // Known distance: NYC to Chicago is approximately 1145 km
      const chicagoResult = LocationScorer.calculate(
        testLocations.nyc,
        testLocations.chicago,
      );
      expect(chicagoResult.distance).toBeCloseTo(1145, -2); // Within 100km tolerance
    });

    it("should be symmetric (distance A to B equals distance B to A)", () => {
      const result1 = LocationScorer.calculate(
        testLocations.nyc,
        testLocations.la,
      );
      const result2 = LocationScorer.calculate(
        testLocations.la,
        testLocations.nyc,
      );

      expect(result1.distance).toBe(result2.distance);
    });
  });

  describe("score decay behavior", () => {
    it("should show exponential decay pattern", () => {
      // Test multiple distances to verify exponential decay
      const testPoints = [
        { lat: 40.7128, lng: -74.006 }, // NYC (0km)
        { lat: 40.9128, lng: -74.006 }, // ~22km north
        { lat: 41.1128, lng: -74.006 }, // ~44km north
        { lat: 41.3128, lng: -74.006 }, // ~66km north
        { lat: 41.5128, lng: -74.006 }, // ~88km north
      ];

      const scores = testPoints.map((point) =>
        LocationScorer.calculate(testLocations.nyc, {
          latitude: point.lat,
          longitude: point.lng,
        }),
      );

      // Verify decreasing scores
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]?.score).toBeLessThanOrEqual(scores[i - 1]?.score ?? 0);
      }

      // First should be perfect score
      expect(scores[0]?.score).toBe(100);

      // Last should be very low but not zero (within 100km)
      expect(scores[scores.length - 1]?.score).toBeGreaterThan(0);
      expect(scores[scores.length - 1]?.score).toBeLessThan(20);
    });
  });
});
