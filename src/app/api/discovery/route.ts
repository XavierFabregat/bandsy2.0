import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDiscoveryCandidates } from "@/server/matching-queries";
import type {
  DiscoveryFilters,
  PaginationOptions,
} from "@/lib/matching/types/matching-types";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const pagination: PaginationOptions = {
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: Math.min(parseInt(searchParams.get("limit") ?? "20"), 50),
    };

    const filters: DiscoveryFilters = {
      maxDistance: searchParams.get("maxDistance")
        ? parseInt(searchParams.get("maxDistance")!)
        : undefined,
      instruments: searchParams.get("instruments")?.split(",").filter(Boolean),
      genres: searchParams.get("genres")?.split(",").filter(Boolean),
      skillLevel: searchParams.get("skillLevel")?.split(",").filter(Boolean),
      lookingFor: searchParams.get("lookingFor")?.split(",").filter(Boolean),
      ageRange:
        searchParams.get("ageMin") && searchParams.get("ageMax")
          ? {
              min: parseInt(searchParams.get("ageMin")!),
              max: parseInt(searchParams.get("ageMax")!),
            }
          : undefined,
      isActive: searchParams.get("isActive") === "true",
    };

    // Get discovery results
    const result = await getDiscoveryCandidates(userId, filters, pagination);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in discovery API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
