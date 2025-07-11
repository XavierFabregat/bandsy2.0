import { db } from "@/server/db";
import {
  users,
  userInstruments,
  userGenres,
  instruments,
  genres,
  mediaSamples,
  matches,
  conversations,
  messages,
} from "@/server/db/schema";
import { eq, ne, and, or, desc, asc, sql, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type {
  BrowseFilters,
  Genre,
  Sample,
  UserGenre,
  UserInstrument,
  UserProfile,
} from "@/types/api";
import { auth } from "@clerk/nextjs/server";
import type { MatchScore } from "../lib/matching/types/matching-types";

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

export async function getMatchDetails(
  matchId: string,
  currentUserClerkId: string,
) {
  // First verify the current user is part of this match
  const { userId } = await auth();
  if (!userId || userId !== currentUserClerkId) {
    throw new Error("Unauthorized");
  }

  // Get current user's database ID
  const currentUserResult = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, currentUserClerkId))
    .limit(1);

  if (!currentUserResult.length) {
    throw new Error("User not found");
  }

  const currentUserId = currentUserResult[0]!.id;

  // Create aliases for the two users in the match
  const user1 = alias(users, "user1");
  const user2 = alias(users, "user2");

  // Get match details with both users
  const matchResult = await db
    .select({
      id: matches.id,
      user1Id: matches.user1Id,
      user2Id: matches.user2Id,
      matchScore: matches.matchScore,
      matchFactors: matches.matchFactors,
      status: matches.status,
      createdAt: matches.createdAt,
      updatedAt: matches.updatedAt,
      // User 1 details
      user1Username: user1.username,
      user1DisplayName: user1.displayName,
      user1Bio: user1.bio,
      user1Age: user1.age,
      user1ShowAge: user1.showAge,
      user1City: user1.city,
      user1Region: user1.region,
      user1Country: user1.country,
      user1ProfileImage: user1.profileImageUrl,
      user1CreatedAt: user1.createdAt,
      user1UpdatedAt: user1.updatedAt,
      // User 2 details
      user2Username: user2.username,
      user2DisplayName: user2.displayName,
      user2Bio: user2.bio,
      user2Age: user2.age,
      user2ShowAge: user2.showAge,
      user2City: user2.city,
      user2Region: user2.region,
      user2Country: user2.country,
      user2ProfileImage: user2.profileImageUrl,
      user2CreatedAt: user2.createdAt,
      user2UpdatedAt: user2.updatedAt,
      // Conversation info
      conversationId: conversations.id,
    })
    .from(matches)
    .innerJoin(user1, eq(matches.user1Id, user1.id))
    .innerJoin(user2, eq(matches.user2Id, user2.id))
    .leftJoin(conversations, eq(matches.id, conversations.matchId))
    .where(
      and(
        eq(matches.id, matchId),
        or(
          eq(matches.user1Id, currentUserId),
          eq(matches.user2Id, currentUserId),
        ),
      ),
    )
    .limit(1);

  if (!matchResult.length) {
    return null;
  }

  const match = matchResult[0]!;

  // Verify current user is part of the match
  if (match.user1Id !== currentUserId && match.user2Id !== currentUserId) {
    throw new Error("Access denied");
  }

  // Helper function to get instruments by user ID
  async function getUserInstrumentsByUserId(userId: string) {
    const result = await db
      .select({
        id: instruments.id,
        name: instruments.name,
        category: instruments.category,
        skillLevel: userInstruments.skillLevel,
        yearsOfExperience: userInstruments.yearsOfExperience,
        isPrimary: userInstruments.isPrimary,
      })
      .from(userInstruments)
      .innerJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
      .where(eq(userInstruments.userId, userId));

    return result;
  }

  // Helper function to get genres by user ID
  async function getUserGenresByUserId(userId: string) {
    const result = await db
      .select({
        id: genres.id,
        name: genres.name,
        preference: userGenres.preference,
      })
      .from(userGenres)
      .innerJoin(genres, eq(userGenres.genreId, genres.id))
      .where(eq(userGenres.userId, userId));

    return result;
  }

  // Get the actual instruments and genres
  const [
    user1InstrumentsList,
    user2InstrumentsList,
    user1GenresList,
    user2GenresList,
  ] = await Promise.all([
    getUserInstrumentsByUserId(match.user1Id),
    getUserInstrumentsByUserId(match.user2Id),
    getUserGenresByUserId(match.user1Id),
    getUserGenresByUserId(match.user2Id),
  ]);

  // Build user profiles
  const user1Profile: UserProfile = {
    id: match.user1Id,
    username: match.user1Username,
    displayName: match.user1DisplayName,
    bio: match.user1Bio,
    age: match.user1Age,
    showAge: match.user1ShowAge,
    city: match.user1City,
    region: match.user1Region,
    country: match.user1Country,
    profileImageUrl: match.user1ProfileImage,
    createdAt: match.user1CreatedAt,
    updatedAt: match.user1UpdatedAt,
    instruments: user1InstrumentsList as UserInstrument[],
    genres: user1GenresList as UserGenre[],
  };

  const user2Profile: UserProfile = {
    id: match.user2Id,
    username: match.user2Username,
    displayName: match.user2DisplayName,
    bio: match.user2Bio,
    age: match.user2Age,
    showAge: match.user2ShowAge,
    city: match.user2City,
    region: match.user2Region,
    country: match.user2Country,
    profileImageUrl: match.user2ProfileImage,
    createdAt: match.user2CreatedAt,
    updatedAt: match.user2UpdatedAt,
    instruments: user2InstrumentsList as UserInstrument[],
    genres: user2GenresList as UserGenre[],
  };

  // Check for conversation and messages
  let conversation = null;
  if (match.conversationId) {
    const messageCount = await db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.conversationId, match.conversationId));

    const hasMessages = messageCount[0]?.count && messageCount[0].count > 0;

    conversation = {
      id: match.conversationId,
      hasMessages: Boolean(hasMessages),
    };
  }

  // Determine which user is the current user and return appropriately structured data
  const isUser1Current = match.user1Id === currentUserId;

  return {
    id: match.id,
    user1: user1Profile,
    user2: user2Profile,
    currentUser: isUser1Current ? user1Profile : user2Profile,
    otherUser: isUser1Current ? user2Profile : user1Profile,
    matchScore: match.matchScore ? parseFloat(match.matchScore) : null,
    matchFactors: match.matchFactors as MatchScore["factors"],
    status: match.status as "active" | "unmatched" | "blocked",
    createdAt: match.createdAt,
    updatedAt: match.updatedAt,
    conversation,
  };
}
