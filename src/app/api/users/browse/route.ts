import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { browseUsers } from "@/server/queries";
import type { BrowseFilters } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters: BrowseFilters = {
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: Math.min(parseInt(searchParams.get("limit") ?? "20"), 50),
      search: searchParams.get("search") ?? "",
      instrument: searchParams.get("instrument") ?? undefined,
      genre: searchParams.get("genre") ?? undefined,
      skillLevel: searchParams.get("skillLevel") as
        | "beginner"
        | "intermediate"
        | "advanced"
        | "professional"
        | undefined,
      location: searchParams.get("location") ?? undefined,
      sortBy: searchParams.get("sortBy") as
        | "recent"
        | "name"
        | "location"
        | undefined,
      sortOrder: searchParams.get("sortOrder") as "asc" | "desc" | undefined,
    };

    // Execute the query
    const result = await browseUsers(userId, filters);

    return NextResponse.json({
      data: result.data,
      pagination: result.pagination,
      filters,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
