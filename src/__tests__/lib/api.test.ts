import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  browseUsers,
  discoverUsers,
  recordInteraction,
  getInstruments,
  getGenres,
  buildBrowseUrl,
} from "@/lib/api";
import type { BrowseFilters, Instrument, Genre } from "@/types/api";
import type {
  DiscoveryFilters,
  PaginationOptions,
} from "@/lib/matching/types/matching-types";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variable
const originalEnv = process.env.NEXT_PUBLIC_API_URL;
process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";

describe("api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  describe("browseUsers", () => {
    const mockBrowseResponse = {
      users: [
        {
          id: "user-1",
          username: "testuser",
          displayName: "Test User",
          profileImageUrl: "https://example.com/avatar.jpg",
          bio: "I am a musician",
          age: 25,
          city: "New York",
          region: "NY",
          country: "USA",
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };

    it("should fetch users without filters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockBrowseResponse),
      });

      const result = await browseUsers();

      expect(mockFetch).toHaveBeenCalledWith("/api/users/browse?", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(mockBrowseResponse);
    });

    it("should fetch users with filters", async () => {
      const filters: BrowseFilters = {
        location: "New York",
        instrument: "guitar",
        genre: "rock",
        skillLevel: "intermediate",
        sortBy: "recent",
        sortOrder: "asc",
        page: 1,
        limit: 20,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockBrowseResponse),
      });

      await browseUsers(filters);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("location=New+York"),
        expect.any(Object),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("instrument=guitar"),
        expect.any(Object),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("genre=rock"),
        expect.any(Object),
      );
    });

    it("should filter out undefined, null, and empty string values", async () => {
      const filters: BrowseFilters = {
        location: "New York",
        instrument: undefined,
        genre: undefined,
        skillLevel: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        page: undefined,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockBrowseResponse),
      });

      await browseUsers(filters);

      const calledUrl = mockFetch?.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain("location=New+York");
      expect(calledUrl).not.toContain("instrument");
      expect(calledUrl).not.toContain("genre");
    });

    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(browseUsers()).rejects.toThrow(
        "Failed to fetch users: Internal Server Error",
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(browseUsers()).rejects.toThrow("Network error");
    });
  });

  describe("discoverUsers", () => {
    const mockDiscoveryResponse = {
      candidates: [
        {
          user: {
            id: "user-1",
            username: "testuser",
            displayName: "Test User",
            profileImageUrl: "https://example.com/avatar.jpg",
            bio: "I am a musician",
            age: 25,
          },
          profile: {
            id: "profile-1",
            userId: "user-1",
            location: { latitude: 40.7128, longitude: -74.006 },
            genres: [],
            instruments: [],
            skillLevelAverage: 2.5,
            activityScore: 80,
            lastActive: new Date(),
            isActive: true,
            searchRadius: 50,
            ageRange: { min: 20, max: 35 },
            lookingFor: "band" as const,
            updatedAt: new Date(),
          },
          score: {
            overall: 85,
            factors: {
              location: 90,
              genres: 80,
              instruments: 85,
              experience: 90,
              activity: 95,
            },
            explanation: ["Great match!"],
            confidence: 0.9,
          },
          distance: 5.2,
          lastActive: new Date(),
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        hasMore: false,
      },
    };

    it("should fetch discovery results with default pagination", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDiscoveryResponse),
      });

      const result = await discoverUsers();

      expect(mockFetch).toHaveBeenCalledWith("/api/discovery?page=1&limit=20", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(mockDiscoveryResponse);
    });

    it("should fetch discovery results with custom pagination", async () => {
      const pagination: PaginationOptions = { page: 2, limit: 10 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDiscoveryResponse),
      });

      await discoverUsers({}, pagination);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/discovery?page=2&limit=10",
        expect.any(Object),
      );
    });

    it("should fetch discovery results with filters", async () => {
      const filters: DiscoveryFilters = {
        maxDistance: 50,
        instruments: ["guitar", "drums"],
        genres: ["rock", "jazz"],
        skillLevel: ["intermediate", "advanced"],
        lookingFor: ["band", "jam_session"],
        ageRange: { min: 21, max: 35 },
        isActive: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDiscoveryResponse),
      });

      await discoverUsers(filters);

      const calledUrl = mockFetch?.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain("maxDistance=50");
      expect(calledUrl).toContain("instruments=guitar%2Cdrums");
      expect(calledUrl).toContain("genres=rock%2Cjazz");
      expect(calledUrl).toContain("skillLevel=intermediate%2Cadvanced");
      expect(calledUrl).toContain("lookingFor=band%2Cjam_session");
      expect(calledUrl).toContain("ageMin=21");
      expect(calledUrl).toContain("ageMax=35");
      expect(calledUrl).toContain("isActive=true");
    });

    it("should handle optional filters", async () => {
      const filters: DiscoveryFilters = {
        maxDistance: 25,
        // Other filters omitted
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDiscoveryResponse),
      });

      await discoverUsers(filters);

      const calledUrl = mockFetch?.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain("maxDistance=25");
      expect(calledUrl).not.toContain("instruments");
      expect(calledUrl).not.toContain("genres");
    });

    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
      });

      await expect(discoverUsers()).rejects.toThrow(
        "Failed to fetch discovery results: Bad Request",
      );
    });
  });

  describe("recordInteraction", () => {
    it("should record like interaction", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await recordInteraction("user-123", "like", "discovery");

      expect(mockFetch).toHaveBeenCalledWith("/api/discovery/interact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: "user-123",
          action: "like",
          context: "discovery",
        }),
      });
    });

    it("should record pass interaction", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await recordInteraction("user-456", "pass", "search");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/discovery/interact",
        expect.objectContaining({
          body: JSON.stringify({
            targetUserId: "user-456",
            action: "pass",
            context: "search",
          }),
        }),
      );
    });

    it("should record super_like interaction", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await recordInteraction("user-789", "super_like", "discovery");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/discovery/interact",
        expect.objectContaining({
          body: JSON.stringify({
            targetUserId: "user-789",
            action: "super_like",
            context: "discovery",
          }),
        }),
      );
    });

    it("should record block interaction", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await recordInteraction("user-000", "block", "search");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/discovery/interact",
        expect.objectContaining({
          body: JSON.stringify({
            targetUserId: "user-000",
            action: "block",
            context: "search",
          }),
        }),
      );
    });

    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      });

      await expect(
        recordInteraction("user-123", "like", "discovery"),
      ).rejects.toThrow("Failed to record interaction: Unauthorized");
    });
  });

  describe("getInstruments", () => {
    const mockInstruments: Instrument[] = [
      { id: "1", name: "Guitar", category: "String" },
      { id: "2", name: "Drums", category: "Percussion" },
      { id: "3", name: "Piano", category: "Keyboard" },
    ];

    it("should fetch instruments successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockInstruments),
      });

      const result = await getInstruments();

      expect(mockFetch).toHaveBeenCalledWith("/api/instruments");
      expect(result).toEqual(mockInstruments);
    });

    it("should handle fetch errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(getInstruments()).rejects.toThrow("Network error");
    });
  });

  describe("getGenres", () => {
    const mockGenres: Genre[] = [
      { id: "1", name: "Rock", parentGenreId: null },
      { id: "2", name: "Jazz", parentGenreId: null },
      { id: "3", name: "Blues", parentGenreId: null },
    ];

    it("should fetch genres successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockGenres),
      });

      const result = await getGenres();

      expect(mockFetch).toHaveBeenCalledWith("/api/genres");
      expect(result).toEqual(mockGenres);
    });

    it("should handle fetch errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(getGenres()).rejects.toThrow("Network error");
    });
  });

  describe("buildBrowseUrl", () => {
    it("should build URL without filters", () => {
      const url = buildBrowseUrl();
      expect(url).toBe("/browse?");
    });

    it("should build URL with single filter", () => {
      const filters: BrowseFilters = { location: "New York" };
      const url = buildBrowseUrl(filters);
      expect(url).toBe("/browse?location=New+York");
    });

    it("should build URL with multiple filters", () => {
      const filters: BrowseFilters = {
        location: "New York",
        instrument: "guitar",
        genre: "rock",
        skillLevel: "intermediate",
        sortBy: "recent",
        sortOrder: "asc",
        page: 1,
        limit: 20,
      };
      const url = buildBrowseUrl(filters);
      expect(url).toContain("/browse?");
      expect(url).toContain("location=New+York");
      expect(url).toContain("instrument=guitar");
      expect(url).toContain("genre=rock");
      expect(url).toContain("skillLevel=intermediate");
      expect(url).toContain("sortBy=recent");
      expect(url).toContain("sortOrder=asc");
      expect(url).toContain("page=1");
      expect(url).toContain("limit=20");
    });

    it("should filter out undefined, null, and empty values", () => {
      const filters: BrowseFilters = {
        location: "New York",
        instrument: undefined,
        genre: undefined,
        skillLevel: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        page: undefined,
        limit: undefined,
      };
      const url = buildBrowseUrl(filters);
      expect(url).toContain("location=New+York");
      expect(url).not.toContain("instrument");
      expect(url).not.toContain("genre");
      expect(url).not.toContain("skillLevel");
      expect(url).not.toContain("sortBy");
      expect(url).not.toContain("sortOrder");
      expect(url).not.toContain("page");
      expect(url).not.toContain("limit");
    });

    it("should handle special characters in filter values", () => {
      const filters: BrowseFilters = {
        location: "San Francisco",
        instrument: "bass guitar",
      };
      const url = buildBrowseUrl(filters);
      expect(url).toContain("location=San+Francisco");
    });

    it("should handle array values", () => {
      const filters: BrowseFilters = {
        instrument: "guitar",
        genre: "rock",
        skillLevel: "intermediate",
        sortBy: "recent",
        sortOrder: "asc",
        page: 1,
        limit: 20,
      };
      const url = buildBrowseUrl(filters);
      expect(url).toContain("instrument=guitar");
      expect(url).toContain("genre=rock");
      expect(url).toContain("skillLevel=intermediate");
      expect(url).toContain("sortBy=recent");
      expect(url).toContain("sortOrder=asc");
      expect(url).toContain("page=1");
      expect(url).toContain("limit=20");
    });
  });

  describe("environment configuration", () => {
    it("should use empty string as default API base URL", async () => {
      delete process.env.NEXT_PUBLIC_API_URL;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      });

      await getInstruments();

      expect(mockFetch).toHaveBeenCalledWith("/api/instruments");
    });

    it("should use configured API base URL", async () => {
      process.env.NEXT_PUBLIC_API_URL = "https://custom.api.com";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      });

      await getInstruments();

      expect(mockFetch).toHaveBeenCalledWith("/api/instruments");
    });
  });

  describe("error scenarios", () => {
    it("should handle malformed JSON responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      });

      await expect(getInstruments()).rejects.toThrow("Invalid JSON");
    });

    it("should handle network timeouts", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Request timeout"));

      await expect(browseUsers()).rejects.toThrow("Request timeout");
    });

    it("should handle 404 responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
      });

      await expect(browseUsers()).rejects.toThrow(
        "Failed to fetch users: Not Found",
      );
    });

    it("should handle 500 responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(discoverUsers()).rejects.toThrow(
        "Failed to fetch discovery results: Internal Server Error",
      );
    });
  });
});
