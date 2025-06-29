import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkProfileCompletion,
  getProfileSetupRedirectUrl,
  isProfileSetupRoute,
} from "@/lib/profile-guard";
import { getUserByClerkId } from "@/server/queries";

// Mock the database query
vi.mock("@/server/queries", () => ({
  getUserByClerkId: vi.fn(),
}));

const mockGetUserByClerkId = vi.mocked(getUserByClerkId);

const mockCompleteUser = {
  id: "user-1",
  clerkId: "clerk-123",
  username: "testuser",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  displayName: "Test User",
  showAge: true,
  latitude: "40.7128",
  longitude: "-74.006",
  profileImageUrl: "https://example.com/avatar.jpg",
  isActive: true,
  lastActiveAt: new Date(),
  deletedAt: null,
  bio: "I am a musician",
  age: 25,
  city: "New York",
  region: "NY",
  country: "USA",
  imageUrl: "https://example.com/avatar.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("profile-guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkProfileCompletion", () => {
    describe("when user does not exist", () => {
      it("should return incomplete status with profile missing", async () => {
        mockGetUserByClerkId.mockResolvedValue(null);

        const result = await checkProfileCompletion("clerk-123");

        expect(result).toEqual({
          isComplete: false,
          missingFields: ["profile"],
          completionPercentage: 0,
        });
        expect(mockGetUserByClerkId).toHaveBeenCalledWith("clerk-123");
      });
    });

    describe("when user exists", () => {
      it("should return complete status for fully filled profile", async () => {
        mockGetUserByClerkId.mockResolvedValue(mockCompleteUser);

        const result = await checkProfileCompletion("clerk-123");

        expect(result).toEqual({
          isComplete: true,
          missingFields: [],
          completionPercentage: 100,
        });
      });

      it("should identify missing bio field", async () => {
        const incompleteUser = { ...mockCompleteUser, bio: null };
        mockGetUserByClerkId.mockResolvedValue(incompleteUser);

        const result = await checkProfileCompletion("clerk-123");

        expect(result.isComplete).toBe(false);
        expect(result.missingFields).toContain("bio");
        expect(result.completionPercentage).toBe(80); // 4/5 fields complete
      });

      it("should identify missing age field", async () => {
        const incompleteUser = { ...mockCompleteUser, age: null };
        mockGetUserByClerkId.mockResolvedValue(incompleteUser);

        const result = await checkProfileCompletion("clerk-123");

        expect(result.isComplete).toBe(false);
        expect(result.missingFields).toContain("age");
        expect(result.completionPercentage).toBe(80);
      });

      it("should identify missing city field", async () => {
        const incompleteUser = { ...mockCompleteUser, city: "" };
        mockGetUserByClerkId.mockResolvedValue(incompleteUser);

        const result = await checkProfileCompletion("clerk-123");

        expect(result.isComplete).toBe(false);
        expect(result.missingFields).toContain("city");
        expect(result.completionPercentage).toBe(80);
      });

      it("should identify missing region field", async () => {
        const incompleteUser = {
          ...mockCompleteUser,
          region: null,
        } as unknown as Awaited<ReturnType<typeof getUserByClerkId>>;

        mockGetUserByClerkId.mockResolvedValue(incompleteUser);

        const result = await checkProfileCompletion("clerk-123");

        expect(result.isComplete).toBe(false);
        expect(result.missingFields).toContain("region");
        expect(result.completionPercentage).toBe(80);
      });

      it("should identify missing country field", async () => {
        const incompleteUser = { ...mockCompleteUser, country: null };
        mockGetUserByClerkId.mockResolvedValue(incompleteUser);

        const result = await checkProfileCompletion("clerk-123");

        expect(result.isComplete).toBe(false);
        expect(result.missingFields).toContain("country");
        expect(result.completionPercentage).toBe(80);
      });

      it("should handle multiple missing fields", async () => {
        const incompleteUser = {
          ...mockCompleteUser,
          bio: null,
          age: null,
          city: "",
        };
        mockGetUserByClerkId.mockResolvedValue(incompleteUser);

        const result = await checkProfileCompletion("clerk-123");

        expect(result.isComplete).toBe(false);
        expect(result.missingFields).toEqual(["bio", "age", "city"]);
        expect(result.completionPercentage).toBe(40); // 2/5 fields complete
      });

      it("should handle all fields missing", async () => {
        const emptyUser = {
          ...mockCompleteUser,
          bio: null,
          age: null,
          city: null,
          region: null,
          country: null,
        };
        mockGetUserByClerkId.mockResolvedValue(emptyUser);

        const result = await checkProfileCompletion("clerk-123");

        expect(result.isComplete).toBe(false);
        expect(result.missingFields).toEqual([
          "bio",
          "age",
          "city",
          "region",
          "country",
        ]);
        expect(result.completionPercentage).toBe(0);
      });

      it("should treat empty strings as missing fields", async () => {
        const userWithEmptyStrings = {
          ...mockCompleteUser,
          bio: "",
          city: "",
          region: "",
        };
        mockGetUserByClerkId.mockResolvedValue(userWithEmptyStrings);

        const result = await checkProfileCompletion("clerk-123");

        expect(result.isComplete).toBe(false);
        expect(result.missingFields).toEqual(["bio", "city", "region"]);
        expect(result.completionPercentage).toBe(40);
      });

      it("should round completion percentage correctly", async () => {
        // Test with 1 out of 5 fields complete (20%)
        const mostlyIncompleteUser = {
          ...mockCompleteUser,
          bio: null,
          age: null,
          city: null,
          region: null,
          // country remains complete
        };
        mockGetUserByClerkId.mockResolvedValue(mostlyIncompleteUser);

        const result = await checkProfileCompletion("clerk-123");

        expect(result.completionPercentage).toBe(20);
      });
    });

    describe("error handling", () => {
      it("should handle database errors gracefully", async () => {
        mockGetUserByClerkId.mockRejectedValue(new Error("Database error"));

        await expect(checkProfileCompletion("clerk-123")).rejects.toThrow(
          "Database error",
        );
      });

      it("should handle invalid clerk ID", async () => {
        mockGetUserByClerkId.mockResolvedValue(null);

        const result = await checkProfileCompletion("");

        expect(result.isComplete).toBe(false);
        expect(result.missingFields).toEqual(["profile"]);
        expect(result.completionPercentage).toBe(0);
      });
    });
  });

  describe("getProfileSetupRedirectUrl", () => {
    it("should return the correct profile setup URL", () => {
      const url = getProfileSetupRedirectUrl();

      expect(url).toBe("/profile/setup");
    });

    it("should always return the same URL", () => {
      const url1 = getProfileSetupRedirectUrl();
      const url2 = getProfileSetupRedirectUrl();

      expect(url1).toBe(url2);
      expect(url1).toBe("/profile/setup");
    });
  });

  describe("isProfileSetupRoute", () => {
    describe("profile setup routes", () => {
      it("should return true for exact profile setup route", () => {
        expect(isProfileSetupRoute("/profile/setup")).toBe(true);
      });

      it("should return true for profile setup sub-routes", () => {
        expect(isProfileSetupRoute("/profile/setup/basic-info")).toBe(true);
        expect(isProfileSetupRoute("/profile/setup/location")).toBe(true);
        expect(isProfileSetupRoute("/profile/setup/genres")).toBe(true);
        expect(isProfileSetupRoute("/profile/setup/instruments")).toBe(true);
        expect(isProfileSetupRoute("/profile/setup/media")).toBe(true);
      });

      it("should return true for nested profile setup routes", () => {
        expect(isProfileSetupRoute("/profile/setup/step/1")).toBe(true);
        expect(isProfileSetupRoute("/profile/setup/complete")).toBe(true);
        expect(isProfileSetupRoute("/profile/setup/anything/nested")).toBe(
          true,
        );
      });

      it("should return true for profile setup routes with query params", () => {
        expect(isProfileSetupRoute("/profile/setup?step=1")).toBe(true);
        expect(
          isProfileSetupRoute("/profile/setup/basic-info?return=true"),
        ).toBe(true);
      });

      it("should return true for profile setup routes with hash", () => {
        expect(isProfileSetupRoute("/profile/setup#section")).toBe(true);
        expect(isProfileSetupRoute("/profile/setup/location#form")).toBe(true);
      });
    });

    describe("non-profile setup routes", () => {
      it("should return false for root route", () => {
        expect(isProfileSetupRoute("/")).toBe(false);
      });

      it("should return false for other profile routes", () => {
        expect(isProfileSetupRoute("/profile")).toBe(false);
        expect(isProfileSetupRoute("/profile/edit")).toBe(false);
        expect(isProfileSetupRoute("/profile/view")).toBe(false);
      });

      it("should return false for similar but different routes", () => {
        expect(isProfileSetupRoute("/profile-setup")).toBe(false);
        expect(isProfileSetupRoute("/setup/profile")).toBe(false);
        expect(isProfileSetupRoute("/profile/complete-setup")).toBe(false);
      });

      it("should return false for other app routes", () => {
        expect(isProfileSetupRoute("/browse")).toBe(false);
        expect(isProfileSetupRoute("/discover")).toBe(false);
        expect(isProfileSetupRoute("/samples")).toBe(false);
        expect(isProfileSetupRoute("/u/username")).toBe(false);
      });

      it("should return false for empty or invalid paths", () => {
        expect(isProfileSetupRoute("")).toBe(false);
        expect(isProfileSetupRoute(" ")).toBe(false);
      });
    });

    describe("edge cases", () => {
      it("should handle paths with trailing slashes", () => {
        expect(isProfileSetupRoute("/profile/setup/")).toBe(true);
        expect(isProfileSetupRoute("/profile/setup/basic-info/")).toBe(true);
      });

      it("should be case sensitive", () => {
        expect(isProfileSetupRoute("/Profile/Setup")).toBe(false);
        expect(isProfileSetupRoute("/PROFILE/SETUP")).toBe(false);
        expect(isProfileSetupRoute("/profile/Setup")).toBe(false);
      });

      it("should handle special characters in paths", () => {
        expect(isProfileSetupRoute("/profile/setup/step-1")).toBe(true);
        expect(isProfileSetupRoute("/profile/setup/step_1")).toBe(true);
        expect(isProfileSetupRoute("/profile/setup/step%201")).toBe(true);
      });
    });
  });

  describe("integration scenarios", () => {
    it("should work together for complete profile flow", async () => {
      // User with incomplete profile
      const incompleteUser = {
        ...mockCompleteUser,
        bio: null,
        age: null,
      } as unknown as Awaited<ReturnType<typeof getUserByClerkId>>;
      mockGetUserByClerkId.mockResolvedValue(incompleteUser);

      const status = await checkProfileCompletion("clerk-123");

      expect(status.isComplete).toBe(false);
      expect(status.completionPercentage).toBe(60);

      // Should redirect to setup
      const redirectUrl = getProfileSetupRedirectUrl();
      expect(redirectUrl).toBe("/profile/setup");

      // Should recognize setup routes
      expect(isProfileSetupRoute(redirectUrl)).toBe(true);
    });

    it("should handle complete profile scenario", async () => {
      mockGetUserByClerkId.mockResolvedValue(mockCompleteUser);

      const status = await checkProfileCompletion("clerk-123");

      expect(status.isComplete).toBe(true);
      expect(status.completionPercentage).toBe(100);
      expect(status.missingFields).toEqual([]);
    });
  });
});
