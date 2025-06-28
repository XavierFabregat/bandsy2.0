import type {
  BrowseUsersResponse,
  BrowseFilters,
  Instrument,
  Genre,
} from "@/types/api";
import type {
  DiscoveryFilters,
  PaginationOptions,
} from "@/lib/matching/types/matching-types";
import type { DiscoveryResult } from "@/server/matching-queries";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function browseUsers(
  filters: BrowseFilters = {},
): Promise<BrowseUsersResponse> {
  const params = new URLSearchParams();

  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const url = `${API_BASE_URL}/api/users/browse?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json() as Promise<BrowseUsersResponse>;
}

// NEW: Smart discovery API
export async function discoverUsers(
  filters: DiscoveryFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 20 },
): Promise<DiscoveryResult> {
  const params = new URLSearchParams();

  // Add pagination
  params.append("page", String(pagination.page));
  params.append("limit", String(pagination.limit));

  // Add filters
  if (filters.maxDistance)
    params.append("maxDistance", String(filters.maxDistance));
  if (filters.instruments?.length)
    params.append("instruments", filters.instruments.join(","));
  if (filters.genres?.length) params.append("genres", filters.genres.join(","));
  if (filters.skillLevel?.length)
    params.append("skillLevel", filters.skillLevel.join(","));
  if (filters.lookingFor?.length)
    params.append("lookingFor", filters.lookingFor.join(","));
  if (filters.ageRange) {
    params.append("ageMin", String(filters.ageRange.min));
    params.append("ageMax", String(filters.ageRange.max));
  }
  if (filters.isActive !== undefined)
    params.append("isActive", String(filters.isActive));

  const url = `${API_BASE_URL}/api/discovery?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch discovery results: ${response.statusText}`,
    );
  }

  return response.json() as Promise<DiscoveryResult>;
}

// NEW: Record user interaction
export async function recordInteraction(
  targetUserId: string,
  action: "like" | "pass" | "super_like" | "block",
  context: "search" | "discovery",
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/discovery/interact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      targetUserId,
      action,
      context,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to record interaction: ${response.statusText}`);
  }
}

export async function getInstruments(): Promise<Instrument[]> {
  const response = await fetch(`${API_BASE_URL}/api/instruments`);
  return response.json() as Promise<Instrument[]>;
}

export async function getGenres(): Promise<Genre[]> {
  const response = await fetch(`${API_BASE_URL}/api/genres`);
  return response.json() as Promise<Genre[]>;
}

// Helper function to build filter URL
export function buildBrowseUrl(filters: BrowseFilters = {}): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  return `/browse?${params.toString()}`;
}
