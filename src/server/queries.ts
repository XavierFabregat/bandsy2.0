import { db } from "@/server/db";
import {
  users,
  userInstruments,
  userGenres,
  instruments,
  genres,
  mediaSamples,
} from "@/server/db/schema";
import { eq, ne, and, or, desc, asc, sql, count } from "drizzle-orm";
import type {
  BrowseFilters,
  Genre,
  Sample,
  UserGenre,
  UserInstrument,
  UserProfile,
} from "@/types/api";
import { auth } from "@clerk/nextjs/server";

export interface BrowseUsersResult {
  data: Array<{
    id: string;
    username: string;
    displayName: string;
    bio: string | null;
    age: number | null;
    showAge: boolean | null;
    city: string | null;
    region: string | null;
    country: string | null;
    profileImageUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    instruments: Array<{
      id: string;
      name: string;
      category: string;
      skillLevel: string;
      yearsOfExperience: number;
      isPrimary: boolean;
    }>;
    genres: Array<{
      id: string;
      name: string;
      preference: number;
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function browseUsers(
  currentUserId: string,
  filters: BrowseFilters = {},
): Promise<BrowseUsersResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }
  const {
    page = 1,
    limit = 20,
    search = "",
    instrument,
    genre,
    skillLevel,
    location,
    sortBy = "recent",
    sortOrder = "desc",
  } = filters;

  const maxLimit = Math.min(limit, 50); // Max 50 per page
  const offset = (page - 1) * maxLimit;

  // Build the base query
  const query = db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      bio: users.bio,
      age: users.age,
      showAge: users.showAge,
      city: users.city,
      region: users.region,
      country: users.country,
      profileImageUrl: users.profileImageUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      // Aggregate instruments and genres
      instruments: sql<string>`COALESCE(
        json_agg(
          DISTINCT CASE 
            WHEN ${instruments.id} IS NOT NULL 
            THEN jsonb_build_object(
              'id', ${instruments.id},
              'name', ${instruments.name},
              'category', ${instruments.category},
              'skillLevel', ${userInstruments.skillLevel},
              'yearsOfExperience', ${userInstruments.yearsOfExperience},
              'isPrimary', ${userInstruments.isPrimary}
            )
            ELSE NULL
          END
        ) FILTER (WHERE ${instruments.id} IS NOT NULL),
        '[]'::json
      )`.as("instruments"),
      genres: sql<string>`COALESCE(
        json_agg(
          DISTINCT CASE 
            WHEN ${genres.id} IS NOT NULL 
            THEN jsonb_build_object(
              'id', ${genres.id},
              'name', ${genres.name},
              'preference', ${userGenres.preference}
            )
            ELSE NULL
          END
        ) FILTER (WHERE ${genres.id} IS NOT NULL),
        '[]'::json
      )`.as("genres"),
    })
    .from(users)
    .leftJoin(userInstruments, eq(users.id, userInstruments.userId))
    .leftJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
    .leftJoin(userGenres, eq(users.id, userGenres.userId))
    .leftJoin(genres, eq(userGenres.genreId, genres.id))
    .where(
      and(
        ne(users.clerkId, currentUserId), // Exclude current user
        eq(users.isActive, true), // Only active users
        // Search filter
        search
          ? or(
              sql`lower(${users.displayName}) like lower(${`%${search}%`})`,
              sql`lower(${users.username}) like lower(${`%${search}%`})`,
              sql`lower(${users.bio}) like lower(${`%${search}%`})`,
              sql`lower(${instruments.name}) like lower(${`%${search}%`})`,
              sql`lower(${genres.name}) like lower(${`%${search}%`})`,
            )
          : undefined,
        // Instrument filter
        instrument ? eq(instruments.name, instrument) : undefined,
        // Genre filter
        genre ? eq(genres.name, genre) : undefined,
        // Skill level filter
        skillLevel ? eq(userInstruments.skillLevel, skillLevel) : undefined,
        // Location filter (basic city matching)
        location
          ? sql`lower(${users.city}) like lower(${`%${location}%`})`
          : undefined,
      ),
    )
    .groupBy(users.id)
    .orderBy(
      sortBy === "name"
        ? sortOrder === "desc"
          ? desc(users.displayName)
          : asc(users.displayName)
        : sortBy === "location"
          ? sortOrder === "desc"
            ? desc(users.city)
            : asc(users.city)
          : // Default: recent activity
            sortOrder === "desc"
            ? desc(users.updatedAt)
            : asc(users.updatedAt),
    )
    .limit(maxLimit)
    .offset(offset);

  // Execute the query
  const results = await query;

  // Get total count for pagination
  const countQuery = db
    .select({ count: count() })
    .from(users)
    .leftJoin(userInstruments, eq(users.id, userInstruments.userId))
    .leftJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
    .leftJoin(userGenres, eq(users.id, userGenres.userId))
    .leftJoin(genres, eq(userGenres.genreId, genres.id))
    .where(
      and(
        ne(users.clerkId, currentUserId),
        eq(users.isActive, true),
        search
          ? or(
              sql`lower(${users.displayName}) like lower(${`%${search}%`})`,
              sql`lower(${users.username}) like lower(${`%${search}%`})`,
              sql`lower(${users.bio}) like lower(${`%${search}%`})`,
              sql`lower(${instruments.name}) like lower(${`%${search}%`})`,
              sql`lower(${genres.name}) like lower(${`%${search}%`})`,
            )
          : undefined,
        instrument ? eq(instruments.name, instrument) : undefined,
        genre ? eq(genres.name, genre) : undefined,
        skillLevel ? eq(userInstruments.skillLevel, skillLevel) : undefined,
        location
          ? sql`lower(${users.city}) like lower(${`%${location}%`})`
          : undefined,
      ),
    )
    .groupBy(users.id);

  const totalResults = await countQuery;
  const total = totalResults.length;

  // Process results to parse JSON aggregates
  const processedResults = results.map((user) => ({
    ...user,
    instruments: (() => {
      try {
        if (!user.instruments || user.instruments === "[object Object]")
          return [];
        const parsed = JSON.parse(user.instruments) as unknown;
        return Array.isArray(parsed)
          ? (parsed as Array<{
              id: string;
              name: string;
              category: string;
              skillLevel: string;
              yearsOfExperience: number;
              isPrimary: boolean;
            }>)
          : [];
      } catch {
        return [];
      }
    })(),
    genres: (() => {
      try {
        if (!user.genres || user.genres === "[object Object]") return [];
        const parsed = JSON.parse(user.genres) as unknown;
        return Array.isArray(parsed)
          ? (parsed as Array<{
              id: string;
              name: string;
              preference: number;
            }>)
          : [];
      } catch {
        return [];
      }
    })(),
  }));

  // Calculate pagination info
  const totalPages = Math.ceil(total / maxLimit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data: processedResults,
    pagination: {
      page,
      limit: maxLimit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
}

// Additional query functions can be added here
export async function getUserById(userId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] ?? null;
}

export async function getUserByClerkId(clerkId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return result[0] ?? null;
}

export async function getInstruments() {
  return db.select().from(instruments).orderBy(instruments.name);
}

export async function getGenres() {
  return db.select().from(genres).orderBy(genres.name);
}

export async function getUserInstruments(clerkId: string) {
  const result = await db
    .select({
      instrumentId: userInstruments.instrumentId,
      skillLevel: userInstruments.skillLevel,
      yearsOfExperience: userInstruments.yearsOfExperience,
      isPrimary: userInstruments.isPrimary,
    })
    .from(userInstruments)
    .innerJoin(users, eq(userInstruments.userId, users.id))
    .where(eq(users.clerkId, clerkId))
    .orderBy(userInstruments.isPrimary, userInstruments.createdAt);

  return result;
}

export async function getUserGenres(clerkId: string) {
  const result = await db
    .select({
      genreId: userGenres.genreId,
      preference: userGenres.preference,
    })
    .from(userGenres)
    .innerJoin(users, eq(userGenres.userId, users.id))
    .where(eq(users.clerkId, clerkId))
    .orderBy(userGenres.preference, userGenres.createdAt);

  return result;
}

export async function getCurrentUserProfile(clerkId: string) {
  const result = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      bio: users.bio,
      age: users.age,
      showAge: users.showAge,
      city: users.city,
      region: users.region,
      country: users.country,
      profileImageUrl: users.profileImageUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      // Aggregate instruments and genres
      instruments: sql<UserInstrument[]>`COALESCE(
        json_agg(
          DISTINCT CASE 
            WHEN ${instruments.id} IS NOT NULL 
            THEN jsonb_build_object(
              'id', ${instruments.id},
              'name', ${instruments.name},
              'category', ${instruments.category},
              'skillLevel', ${userInstruments.skillLevel},
              'yearsOfExperience', ${userInstruments.yearsOfExperience},
              'isPrimary', ${userInstruments.isPrimary}
            )
            ELSE NULL
          END
        ) FILTER (WHERE ${instruments.id} IS NOT NULL),
        '[]'::json
      )`.as("instruments"),
      genres: sql<UserGenre[]>`COALESCE(
        json_agg(
          DISTINCT CASE 
            WHEN ${genres.id} IS NOT NULL 
            THEN jsonb_build_object(
              'id', ${genres.id},
              'name', ${genres.name},
              'preference', ${userGenres.preference}
            )
            ELSE NULL
          END
        ) FILTER (WHERE ${genres.id} IS NOT NULL),
        '[]'::json
      )`.as("genres"),
    })
    .from(users)
    .leftJoin(userInstruments, eq(users.id, userInstruments.userId))
    .leftJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
    .leftJoin(userGenres, eq(users.id, userGenres.userId))
    .leftJoin(genres, eq(userGenres.genreId, genres.id))
    .where(eq(users.clerkId, clerkId))
    .groupBy(users.id)
    .limit(1);

  console.log("result", result);
  console.log("DB URL", process.env.DATABASE_URL);

  if (!result.length) return null;

  const user = result[0]!;

  return user;
}

export async function getUserByUsername(username: string) {
  const result = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      bio: users.bio,
      age: users.age,
      showAge: users.showAge,
      city: users.city,
      region: users.region,
      country: users.country,
      profileImageUrl: users.profileImageUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      // Aggregate instruments and genres
      instruments: sql<UserInstrument[]>`COALESCE(
        json_agg(
          DISTINCT CASE 
            WHEN ${instruments.id} IS NOT NULL 
            THEN jsonb_build_object(
              'id', ${instruments.id},
              'name', ${instruments.name},
              'category', ${instruments.category},
              'skillLevel', ${userInstruments.skillLevel},
              'yearsOfExperience', ${userInstruments.yearsOfExperience},
              'isPrimary', ${userInstruments.isPrimary}
            )
            ELSE NULL
          END
        ) FILTER (WHERE ${instruments.id} IS NOT NULL),
        '[]'::json
      )`.as("instruments"),
      genres: sql<UserGenre[]>`COALESCE(
        json_agg(
          DISTINCT CASE 
            WHEN ${genres.id} IS NOT NULL 
            THEN jsonb_build_object(
              'id', ${genres.id},
              'name', ${genres.name},
              'preference', ${userGenres.preference}
            )
            ELSE NULL
          END
        ) FILTER (WHERE ${genres.id} IS NOT NULL),
        '[]'::json
      )`.as("genres"),
    })
    .from(users)
    .leftJoin(userInstruments, eq(users.id, userInstruments.userId))
    .leftJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
    .leftJoin(userGenres, eq(users.id, userGenres.userId))
    .leftJoin(genres, eq(userGenres.genreId, genres.id))
    .where(eq(users.username, username))
    .groupBy(users.id)
    .limit(1);

  if (!result.length) return null;

  const user = result[0]!;

  return user as UserProfile;
}

export async function getUserSamples(userId: string) {
  const user = await db.select().from(users).where(eq(users.id, userId));

  if (!user.length) {
    throw new Error("User not found");
  }

  const { userId: currentUserClerkId } = await auth();

  const isOwnUser = user[0]?.clerkId === currentUserClerkId;

  let result = await db.query.mediaSamples.findMany({
    where: eq(mediaSamples.userId, userId),
    with: {
      instrument: true,
      mediaSampleGenres: {
        with: {
          genre: true,
        },
      },
    },
    orderBy: desc(mediaSamples.createdAt),
  });

  if (!isOwnUser) {
    // filter out private samples
    result = result.filter((sample) => sample.isPublic);
  }

  // Transform the result to flatten genres
  const samples = result.map((sample) => ({
    ...sample,
    genres: sample.mediaSampleGenres.map(
      (msg) => (msg.genre as Genre) ?? ({} as Genre),
    ),
    mediaSampleGenres: undefined, // Remove the junction table data
  }));

  return samples as Sample[];
}

export async function getSample(userId: string, sampleId: string) {
  const result = await db.query.mediaSamples.findFirst({
    where: and(eq(mediaSamples.id, sampleId), eq(mediaSamples.userId, userId)),
    with: {
      instrument: true,
      mediaSampleGenres: {
        with: {
          genre: true,
        },
      },
    },
  });

  if (!result) return null;

  // Transform the result to flatten genres
  return {
    ...result,
    genres: result.mediaSampleGenres.map(
      (msg) => (msg.genre as Genre) ?? ({} as Genre),
    ),
    mediaSampleGenres: undefined, // Remove the junction table data
  } as Sample;
}
