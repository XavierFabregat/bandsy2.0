import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { browseUsers, getInstruments, getGenres } from "@/server/queries";
import type { BrowseFilters } from "@/types/api";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import Link from "next/link";

interface BrowsePageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    instrument?: string;
    genre?: string;
    skillLevel?: string;
    location?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  // Get authenticated user
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  // Await searchParams (Next.js 15 change)
  const params = await searchParams;

  // Parse filters from search params
  const filters: BrowseFilters = {
    page: params.page ? parseInt(params.page) : 1,
    search: params.search ?? "",
    instrument: params.instrument,
    genre: params.genre,
    skillLevel: params.skillLevel as
      | "beginner"
      | "intermediate"
      | "advanced"
      | "professional"
      | undefined,
    location: params.location,
    sortBy: params.sortBy as "recent" | "name" | "location" | undefined,
    sortOrder: params.sortOrder as "asc" | "desc" | undefined,
  };

  // Fetch data using server-side queries
  const [usersResult, instruments, genres] = await Promise.all([
    browseUsers(userId, filters),
    getInstruments(),
    getGenres(),
  ]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">
              Browse Musicians
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover and connect with musicians in your area
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/discover"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 font-semibold transition-colors"
            >
              Smart Discovery
            </Link>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-muted/50 mb-8 rounded-lg p-6">
          <h2 className="text-foreground mb-4 text-xl font-semibold">
            Filters
          </h2>
          <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              name="search"
              placeholder="Search musicians..."
              defaultValue={filters.search}
              className="bg-background border-input text-foreground placeholder-muted-foreground focus:ring-ring rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
            />
            <select
              name="instrument"
              defaultValue={filters.instrument}
              className="bg-background border-input text-foreground focus:ring-ring rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
            >
              <option value="">All Instruments</option>
              {instruments.map((instrument) => (
                <option key={instrument.id} value={instrument.name}>
                  {instrument.name}
                </option>
              ))}
            </select>
            <select
              name="genre"
              defaultValue={filters.genre}
              className="bg-background border-input text-foreground focus:ring-ring rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.name}>
                  {genre.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 font-semibold transition-colors"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {usersResult.data.length} of{" "}
              {usersResult.pagination.total} musicians
            </p>
            <div className="flex gap-2">
              <select
                name="sortBy"
                defaultValue={filters.sortBy}
                className="bg-background border-input text-foreground focus:ring-ring rounded-lg border px-3 py-1 text-sm focus:ring-2 focus:outline-none"
              >
                <option value="recent">Recent</option>
                <option value="name">Name</option>
                <option value="location">Location</option>
              </select>
              <select
                name="sortOrder"
                defaultValue={filters.sortOrder}
                className="bg-background border-input text-foreground focus:ring-ring rounded-lg border px-3 py-1 text-sm focus:ring-2 focus:outline-none"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>

          {/* User Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {usersResult.data.map((user) => (
              <div
                key={user.id}
                className="bg-card border-border hover:bg-muted/50 rounded-lg border p-6 transition-colors"
              >
                <div className="mb-4 flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-full border object-cover">
                    <AvatarImage
                      src={user.profileImageUrl ?? "/default-avatar.png"}
                      className="h-16 w-16 rounded-full border object-cover"
                    />
                    <AvatarFallback className="h-16 w-16 rounded-full border object-cover text-4xl">
                      {user.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      {user.displayName}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      @{user.username}
                    </p>
                    {user.city && (
                      <p className="text-muted-foreground text-sm">
                        📍 {user.city}
                      </p>
                    )}
                  </div>
                </div>

                {user.bio && (
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                {/* Instruments */}
                {user.instruments.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-foreground mb-2 text-sm font-semibold">
                      Instruments
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {user.instruments.map((instrument) => (
                        <span
                          key={instrument.id}
                          className="bg-primary/10 text-primary border-primary/20 rounded-full border px-2 py-1 text-xs"
                        >
                          {instrument.name} ({instrument.skillLevel})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Genres */}
                {user.genres.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-foreground mb-2 text-sm font-semibold">
                      Genres
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {user.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre.id}
                          className="bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-xs"
                        >
                          {genre.name}
                        </span>
                      ))}
                      {user.genres.length > 3 && (
                        <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-xs">
                          +{user.genres.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <Link
                  href={`/u/${user.username}`}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 block w-full rounded-lg py-2 text-center font-semibold transition-colors"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {usersResult.pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {usersResult.pagination.hasPrevPage && (
                <a
                  href={`/browse?page=${usersResult.pagination.page - 1}`}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg px-4 py-2 transition-colors"
                >
                  Previous
                </a>
              )}
              <span className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
                Page {usersResult.pagination.page} of{" "}
                {usersResult.pagination.totalPages}
              </span>
              {usersResult.pagination.hasNextPage && (
                <a
                  href={`/browse?page=${usersResult.pagination.page + 1}`}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg px-4 py-2 transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
