import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { browseUsers, getInstruments, getGenres } from "@/server/queries";
import type { BrowseFilters } from "@/types/api";

interface BrowsePageProps {
  searchParams: {
    page?: string;
    search?: string;
    instrument?: string;
    genre?: string;
    skillLevel?: string;
    location?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  // Get authenticated user
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Parse filters from search params
  const filters: BrowseFilters = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    search: searchParams.search ?? "",
    instrument: searchParams.instrument,
    genre: searchParams.genre,
    skillLevel: searchParams.skillLevel as
      | "beginner"
      | "intermediate"
      | "advanced"
      | "professional"
      | undefined,
    location: searchParams.location,
    sortBy: searchParams.sortBy as "recent" | "name" | "location" | undefined,
    sortOrder: searchParams.sortOrder as "asc" | "desc" | undefined,
  };

  // Fetch data using server-side queries
  const [usersResult, instruments, genres] = await Promise.all([
    browseUsers(userId, filters),
    getInstruments(),
    getGenres(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Browse Musicians</h1>

      {/* Filters Section */}
      <div className="mb-8 rounded-lg bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Filters</h2>
        <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            name="search"
            placeholder="Search musicians..."
            defaultValue={filters.search}
            className="rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400"
          />
          <select
            name="instrument"
            defaultValue={filters.instrument}
            className="rounded-lg bg-white/10 px-4 py-2 text-white"
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
            className="rounded-lg bg-white/10 px-4 py-2 text-white"
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
            className="rounded-lg bg-[#6c47ff] px-4 py-2 font-semibold text-white hover:bg-[#5a3fd8]"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-300">
            Showing {usersResult.data.length} of {usersResult.pagination.total}{" "}
            musicians
          </p>
          <div className="flex gap-2">
            <select
              name="sortBy"
              defaultValue={filters.sortBy}
              className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white"
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="location">Location</option>
            </select>
            <select
              name="sortOrder"
              defaultValue={filters.sortOrder}
              className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white"
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
              className="rounded-lg bg-white/5 p-6 transition hover:bg-white/10"
            >
              <div className="mb-4 flex items-center gap-4">
                <img
                  src={user.profileImageUrl ?? "/default-avatar.png"}
                  alt={user.displayName}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {user.displayName}
                  </h3>
                  <p className="text-sm text-gray-300">@{user.username}</p>
                  {user.city && (
                    <p className="text-sm text-gray-400">📍 {user.city}</p>
                  )}
                </div>
              </div>

              {user.bio && (
                <p className="mb-4 line-clamp-2 text-gray-300">{user.bio}</p>
              )}

              {/* Instruments */}
              {user.instruments.length > 0 && (
                <div className="mb-3">
                  <h4 className="mb-2 text-sm font-semibold text-white">
                    Instruments
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {user.instruments.map((instrument) => (
                      <span
                        key={instrument.id}
                        className="rounded-full bg-[#6c47ff]/20 px-2 py-1 text-xs text-[#6c47ff]"
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
                  <h4 className="mb-2 text-sm font-semibold text-white">
                    Genres
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {user.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre.id}
                        className="rounded-full bg-white/10 px-2 py-1 text-xs text-white"
                      >
                        {genre.name}
                      </span>
                    ))}
                    {user.genres.length > 3 && (
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white">
                        +{user.genres.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button className="w-full rounded-lg bg-[#6c47ff] py-2 font-semibold text-white transition hover:bg-[#5a3fd8]">
                View Profile
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {usersResult.pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {usersResult.pagination.hasPrevPage && (
              <a
                href={`/browse?page=${usersResult.pagination.page - 1}`}
                className="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20"
              >
                Previous
              </a>
            )}
            <span className="rounded-lg bg-white/10 px-4 py-2 text-white">
              Page {usersResult.pagination.page} of{" "}
              {usersResult.pagination.totalPages}
            </span>
            {usersResult.pagination.hasNextPage && (
              <a
                href={`/browse?page=${usersResult.pagination.page + 1}`}
                className="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20"
              >
                Next
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
