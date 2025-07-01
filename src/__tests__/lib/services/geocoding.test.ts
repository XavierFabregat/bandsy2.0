import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import GeocodingService, {
  type GeocodeServiceResult,
} from "@/lib/services/geocoding";

// Mock the environment config
vi.mock("@/envConfig", () => ({}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("GeocodingService", () => {
  let service: GeocodingService;

  beforeEach(() => {
    // Set up environment variable
    process.env.GEOCODING_API_KEY = "test-api-key";
    service = GeocodingService.getInstance();
    service.clearCache(); // Clear cache between tests
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getInstance", () => {
    it("should return a singleton instance", () => {
      const instance1 = GeocodingService.getInstance();
      const instance2 = GeocodingService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("getCoordinates", () => {
    it("should return coordinates for valid address", async () => {
      const mockResponse = {
        ok: true,
        json: async () => [
          {
            lat: "37.7749",
            lon: "-122.4194",
            display_name: "San Francisco, CA, USA",
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await service.getCoordinates("San Francisco, CA");

      expect(GeocodingService.isError(result)).toBe(false);
      if (!GeocodingService.isError(result)) {
        expect(result.latitude).toBe(37.7749);
        expect(result.longitude).toBe(-122.4194);
        expect(result.displayName).toBe("San Francisco, CA, USA");
      }
    });

    it("should handle empty address", async () => {
      const result = await service.getCoordinates("");

      expect(GeocodingService.isError(result)).toBe(true);
      if (GeocodingService.isError(result)) {
        expect(result.error).toContain(
          "required and must be a non-empty string",
        );
      }
    });

    it("should handle null/undefined address", async () => {
      const result1 = await service.getCoordinates(null as unknown as string);
      const result2 = await service.getCoordinates(
        undefined as unknown as string,
      );

      expect(GeocodingService.isError(result1)).toBe(true);
      expect(GeocodingService.isError(result2)).toBe(true);
    });

    it("should handle API error responses", async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        text: async () => "Rate limit exceeded",
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await service.getCoordinates("Invalid City");

      expect(GeocodingService.isError(result)).toBe(true);
      if (GeocodingService.isError(result)) {
        expect(result.error).toContain("Geocoding API error: 429");
        expect(result.details).toBe("Rate limit exceeded");
      }
    });

    it("should handle empty API response", async () => {
      const mockResponse = {
        ok: true,
        json: async () => [],
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await service.getCoordinates("Nonexistent City");

      expect(GeocodingService.isError(result)).toBe(true);
      if (GeocodingService.isError(result)) {
        expect(result.error).toContain("No results found");
      }
    });

    it("should handle invalid coordinates", async () => {
      const mockResponse = {
        ok: true,
        json: async () => [
          {
            lat: "invalid",
            lon: "invalid",
            display_name: "Invalid City",
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await service.getCoordinates("Invalid City");

      expect(GeocodingService.isError(result)).toBe(true);
      if (GeocodingService.isError(result)) {
        expect(result.error).toContain("Invalid coordinates received");
      }
    });

    it("should handle coordinates outside valid range", async () => {
      const mockResponse = {
        ok: true,
        json: async () => [
          {
            lat: "91", // Invalid latitude (> 90)
            lon: "0",
            display_name: "Invalid Location",
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await service.getCoordinates("Invalid Location");

      expect(GeocodingService.isError(result)).toBe(true);
      if (GeocodingService.isError(result)) {
        expect(result.error).toContain("outside valid range");
      }
    });

    it("should cache successful results", async () => {
      const mockResponse = {
        ok: true,
        json: async () => [
          {
            lat: "37.7749",
            lon: "-122.4194",
            display_name: "San Francisco, CA, USA",
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // First call
      const result1 = await service.getCoordinates("San Francisco, CA");
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await service.getCoordinates("San Francisco, CA");
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional API call

      expect(result1).toEqual(result2);
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await service.getCoordinates("Test City");

      expect(GeocodingService.isError(result)).toBe(true);
      if (GeocodingService.isError(result)) {
        expect(result.error).toContain("Network error");
      }
    });

    it("should properly encode addresses in URLs", async () => {
      const mockResponse = {
        ok: true,
        json: async () => [
          {
            lat: "37.7749",
            lon: "-122.4194",
            display_name: "San Francisco, CA, USA",
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await service.getCoordinates("San Francisco, CA & Special Chars!");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          encodeURIComponent("San Francisco, CA & Special Chars!"),
        ),
        expect.any(Object),
      );
    });
  });

  describe("isError utility", () => {
    it("should correctly identify error results", () => {
      const errorResult = { error: "Test error" };
      const successResult = {
        latitude: 37.7749,
        longitude: -122.4194,
        displayName: "Test",
      };

      expect(GeocodingService.isError(errorResult)).toBe(true);
      expect(GeocodingService.isError(successResult)).toBe(false);
    });
  });
});
