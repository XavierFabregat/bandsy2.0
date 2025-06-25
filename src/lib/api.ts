import type { BrowseUsersResponse, BrowseFilters } from "@/types/api";

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
