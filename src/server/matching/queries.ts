import { db } from "@/server/db";
import {
  users,
  userInstruments,
  userGenres,
  instruments,
  genres,
  userMatchProfiles,
  userInteractions,
  mediaSamples,
  matches,
} from "@/server/db/schema";
import {
  eq,
  ne,
  and,
  desc,
  sql,
  isNull,
  lt,
  gt,
  not,
  exists,
  or,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { auth } from "@clerk/nextjs/server";
import type {
  UserMatchProfile,
  MatchCandidate,
  DiscoveryFilters,
  PaginationOptions,
  Location,
  GenrePreference,
  InstrumentSkill,
  DiscoveryResult,
  DiscoveryHistory,
  MatchScore,
} from "@/lib/matching/types/matching-types";
import { CompositeScorer } from "@/lib/matching/algorithms/composite-scorer";
import { LocationScorer } from "@/lib/matching/algorithms/location-scorer";
import type { Sample, UserProfile } from "@/types/api";
import { createOrUpdateUserMatchProfile } from "./mutations";
import {
  calculateSkillLevelAverage,
  calculateActivityScore,
  getTestLocation,
} from "@/lib/utils";

/**
 * Get or create user match profile with all necessary data
 */
export async function getUserMatchProfile(
  clerkId: string,
): Promise<UserMatchProfile | null> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get user basic info and profile data
  const userResult = await db
    .select({
      id: users.id,
      clerkId: users.clerkId,
      city: users.city,
      region: users.region,
      country: users.country,
      age: users.age,
      updatedAt: users.updatedAt,
      locationLng: users.longitude,
      locationLat: users.latitude,
      // Get match profile if exists
      profileId: userMatchProfiles.id,
      searchRadius: userMatchProfiles.searchRadius,
      ageRangeMin: userMatchProfiles.ageRangeMin,
      ageRangeMax: userMatchProfiles.ageRangeMax,
      lookingFor: userMatchProfiles.lookingFor,
      isActive: userMatchProfiles.isActive,
      lastActive: userMatchProfiles.lastActive,
    })
    .from(users)
    .leftJoin(userMatchProfiles, eq(users.id, userMatchProfiles.userId))
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!userResult.length) return null;

  const user = userResult[0]!;

  // If no profile exists, create one automatically
  if (!user.profileId) {
    console.log(`No match profile found for user ${user.id}, creating one...`);
    await createOrUpdateUserMatchProfile(clerkId);
    // Re-query to get the created profile
    return getUserMatchProfile(clerkId);
  }

  // Get user instruments
  const instrumentsResult = await db
    .select({
      id: instruments.id,
      name: instruments.name,
      category: instruments.category,
      skillLevel: userInstruments.skillLevel,
      yearsOfExperience: userInstruments.yearsOfExperience,
      isPrimary: userInstruments.isPrimary,
    })
    .from(userInstruments)
    .leftJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
    .where(eq(userInstruments.userId, user.id));

  // Get user genres
  const genresResult = await db
    .select({
      id: genres.id,
      name: genres.name,
      preference: userGenres.preference,
      parentGenreId: genres.parentGenreId,
    })
    .from(userGenres)
    .leftJoin(genres, eq(userGenres.genreId, genres.id))
    .where(eq(userGenres.userId, user.id));

  const userInstruments_typed: InstrumentSkill[] = instrumentsResult.map(
    (inst) => ({
      id: inst.id!,
      name: inst.name!,
      category: inst.category!,
      skillLevel: inst.skillLevel as
        | "beginner"
        | "intermediate"
        | "advanced"
        | "expert",
      yearsOfExperience: inst.yearsOfExperience!,
      isPrimary: inst.isPrimary!,
    }),
  );

  const userGenres_typed: GenrePreference[] = genresResult.map((genre) => ({
    id: genre.id!,
    name: genre.name!,
    preference: genre.preference!,
    parentGenreId: genre.parentGenreId ?? undefined,
  }));

  // Default location (SF coordinates if no location set)
  const location: Location = {
    latitude: parseFloat(user.locationLat!),
    longitude: parseFloat(user.locationLng!),
    city: user.city ?? undefined,
    region: user.region ?? undefined,
    country: user.country ?? undefined,
  };

  return {
    id: user.profileId,
    userId: user.id,
    location,
    genres: userGenres_typed,
    instruments: userInstruments_typed,
    skillLevelAverage: calculateSkillLevelAverage(userInstruments_typed),
    activityScore: calculateActivityScore(user.lastActive ?? new Date()),
    lastActive: user.lastActive ?? new Date(),
    isActive: user.isActive ?? true,
    searchRadius: user.searchRadius ?? 50,
    ageRange: {
      min: user.ageRangeMin ?? 18,
      max: user.ageRangeMax ?? 65,
    },
    lookingFor:
      (user.lookingFor as
        | "band"
        | "jam_session"
        | "collaboration"
        | "lessons"
        | "any") ?? "any",
    updatedAt: user.updatedAt ?? new Date(),
  };
}

/**
 * Get discovery candidates with intelligent matching
 */
export async function getDiscoveryCandidates(
  clerkId: string,
  filters: DiscoveryFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 20 },
): Promise<DiscoveryResult> {
  const currentUserProfile = await getUserMatchProfile(clerkId);
  if (!currentUserProfile) {
    throw new Error("User profile not found");
  }

  const currentUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!currentUser.length) {
    throw new Error("Current user not found");
  }

  const currentUserId = currentUser[0]!.id;

  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  // Build discovery query with filters
  const whereConditions = [
    ne(users.clerkId, clerkId), // Exclude current user
    eq(users.isActive, true), // Only active users
    not(
      exists(
        db
          .select()
          .from(userInteractions)
          .where(
            and(
              eq(userInteractions.fromUserId, currentUserId),
              eq(userInteractions.toUserId, users.id),
              or(
                eq(userInteractions.type, "like"),
                eq(userInteractions.type, "super_like"),
                eq(userInteractions.type, "block"),
              ),
            ),
          ),
      ),
    ),
  ];

  // Age range filter
  if (filters.ageRange) {
    whereConditions.push(
      and(
        not(isNull(users.age)),
        gt(users.age, filters.ageRange.min),
        lt(users.age, filters.ageRange.max),
      )!,
    );
  }

  // Get candidate users with their profile data
  const candidatesQuery = db
    .select({
      // User info
      id: users.id,
      clerkId: users.clerkId,
      username: users.username,
      displayName: users.displayName,
      profileImageUrl: users.profileImageUrl,
      bio: users.bio,
      age: users.age,
      city: users.city,
      region: users.region,
      country: users.country,
      updatedAt: users.updatedAt,
      locationLat: users.latitude,
      locationLng: users.longitude,
      // Match profile info
      profileId: userMatchProfiles.id,
      searchRadius: userMatchProfiles.searchRadius,
      ageRangeMin: userMatchProfiles.ageRangeMin,
      ageRangeMax: userMatchProfiles.ageRangeMax,
      lookingFor: userMatchProfiles.lookingFor,
      isActive: userMatchProfiles.isActive,
      lastActive: userMatchProfiles.lastActive,
      // Aggregated instruments, genres, and samples
      instruments: sql<InstrumentSkill[]>`COALESCE(
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
      genres: sql<GenrePreference[]>`COALESCE(
        json_agg(
          DISTINCT CASE 
            WHEN ${genres.id} IS NOT NULL 
            THEN jsonb_build_object(
              'id', ${genres.id},
              'name', ${genres.name},
              'preference', ${userGenres.preference},
              'parentGenreId', ${genres.parentGenreId}
            )
            ELSE NULL
          END
        ) FILTER (WHERE ${genres.id} IS NOT NULL),
        '[]'::json
      )`.as("genres"),
      samples: sql<Sample[]>`COALESCE(
        json_agg(
          DISTINCT CASE 
            WHEN ${mediaSamples.id} IS NOT NULL 
            AND ${mediaSamples.isPublic} IS TRUE
            THEN jsonb_build_object(
              'id', ${mediaSamples.id},
              'fileUrl', ${mediaSamples.fileUrl},
              'fileType', ${mediaSamples.fileType},
              'title', ${mediaSamples.title},
              'description', ${mediaSamples.description},
              'duration', ${mediaSamples.duration},
              'createdAt', ${mediaSamples.createdAt},
              'metadata', ${mediaSamples.metadata},
              'isPublic', ${mediaSamples.isPublic}
            )
            ELSE NULL
          END
        ) FILTER (WHERE ${mediaSamples.id} IS NOT NULL AND ${mediaSamples.isPublic} IS TRUE),
        '[]'::json
      )`.as("samples"),
    })
    .from(users)
    .leftJoin(userMatchProfiles, eq(users.id, userMatchProfiles.userId))
    .leftJoin(userInstruments, eq(users.id, userInstruments.userId))
    .leftJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
    .leftJoin(userGenres, eq(users.id, userGenres.userId))
    .leftJoin(genres, eq(userGenres.genreId, genres.id))
    .leftJoin(mediaSamples, eq(users.id, mediaSamples.userId))
    .where(and(...whereConditions))
    .groupBy(
      users.id,
      userMatchProfiles.id,
      userMatchProfiles.locationLat,
      userMatchProfiles.locationLng,
      userMatchProfiles.searchRadius,
      userMatchProfiles.ageRangeMin,
      userMatchProfiles.ageRangeMax,
      userMatchProfiles.lookingFor,
      userMatchProfiles.isActive,
      userMatchProfiles.lastActive,
    )
    .orderBy(desc(users.updatedAt))
    .limit(limit * 3) // Get more candidates for better filtering
    .offset(offset);

  // Execute query and measure time
  const candidateResults = await candidatesQuery;

  // Process and score candidates
  const scoredCandidates: MatchCandidate[] = [];

  for (const candidate of candidateResults) {
    try {
      // Parse instruments and genres
      let candidateInstruments: InstrumentSkill[] = [];
      let candidateGenres: GenrePreference[] = [];

      try {
        const instrumentsParsed = candidate.instruments;
        candidateInstruments = Array.isArray(instrumentsParsed)
          ? instrumentsParsed
          : [];
      } catch {
        candidateInstruments = [];
      }

      try {
        const genresParsed = candidate.genres;
        candidateGenres = Array.isArray(genresParsed) ? genresParsed : [];
      } catch {
        candidateGenres = [];
      }

      // Determine candidate location - use match profile if exists, otherwise create one
      let candidateLocation: Location;

      if (candidate.locationLat && candidate.locationLng) {
        // Use existing match profile location
        candidateLocation = {
          latitude: parseFloat(candidate.locationLat),
          longitude: parseFloat(candidate.locationLng),
          city: candidate.city ?? undefined,
          region: candidate.region ?? undefined,
          country: candidate.country ?? undefined,
        };
      } else {
        // Create match profile for candidate if they don't have one
        console.log(`Creating match profile for candidate ${candidate.id}`);
        await createOrUpdateUserMatchProfile(candidate.clerkId);

        // Use test location for now
        candidateLocation = getTestLocation(candidate.id);
      }

      // Create candidate match profile
      const candidateProfile: UserMatchProfile = {
        id: candidate.profileId ?? `profile-${candidate.id}`,
        userId: candidate.id,
        location: candidateLocation,
        genres: candidateGenres,
        instruments: candidateInstruments,
        skillLevelAverage: calculateSkillLevelAverage(candidateInstruments),
        activityScore: calculateActivityScore(
          candidate.lastActive ?? new Date(),
        ),
        lastActive: candidate.lastActive ?? new Date(),
        isActive: candidate.isActive ?? true,
        searchRadius: candidate.searchRadius ?? 50,
        ageRange: {
          min: candidate.ageRangeMin ?? 18,
          max: candidate.ageRangeMax ?? 65,
        },
        lookingFor:
          (candidate.lookingFor as
            | "band"
            | "jam_session"
            | "collaboration"
            | "lessons"
            | "any") ?? "any",
        updatedAt: candidate.updatedAt ?? new Date(),
      };

      // Calculate proper distance using LocationScorer
      const maxDistance =
        filters.maxDistance ?? currentUserProfile.searchRadius ?? 100;
      const locationResult = LocationScorer.calculate(
        currentUserProfile.location,
        candidateProfile.location,
        maxDistance,
        25, // decayDistance
      );

      // Filter by distance first
      if (locationResult.distance > maxDistance) {
        continue;
      }

      // Calculate match score
      const matchScore = CompositeScorer.calculate(
        currentUserProfile,
        candidateProfile,
      );

      // Apply filters based on score
      if (matchScore.overall < 30) {
        continue;
      }

      scoredCandidates.push({
        user: {
          id: candidate.id,
          username: candidate.username,
          displayName: candidate.displayName,
          profileImageUrl: candidate.profileImageUrl,
          bio: candidate.bio,
          age: candidate.age,
          samples: candidate.samples,
        },
        profile: candidateProfile,
        score: matchScore,
        distance: locationResult.distance,
        lastActive: candidateProfile.lastActive,
      });
    } catch (error) {
      console.error("Error processing candidate:", error);

      continue;
    }
  }

  // Sort by match score (highest first)
  scoredCandidates.sort((a, b) => b.score.overall - a.score.overall);

  // Apply final pagination
  const finalCandidates = scoredCandidates.slice(0, limit);

  return {
    candidates: finalCandidates,
    pagination: {
      page,
      limit,
      total: scoredCandidates.length,
      hasMore: scoredCandidates.length >= limit,
    },
    filters,
  };
}

export async function getDiscoveryHistory(
  clerkId: string,
): Promise<DiscoveryHistory[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [currentUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!currentUser) throw new Error("User not found");

  // Create aliases for the users table
  const fromUsers = alias(users, "fromUsers");
  const toUsers = alias(users, "toUsers");

  const interactions = await db
    .select({
      id: userInteractions.id,
      type: userInteractions.type,
      context: userInteractions.context,
      createdAt: userInteractions.createdAt,
      fromUser: {
        id: fromUsers.id,
        username: fromUsers.username,
        displayName: fromUsers.displayName,
        profileImageUrl: fromUsers.profileImageUrl,
      },
      toUser: {
        id: toUsers.id,
        username: toUsers.username,
        displayName: toUsers.displayName,
        profileImageUrl: toUsers.profileImageUrl,
      },
    })
    .from(userInteractions)
    .leftJoin(fromUsers, eq(userInteractions.fromUserId, fromUsers.id))
    .leftJoin(toUsers, eq(userInteractions.toUserId, toUsers.id))
    .where(eq(userInteractions.fromUserId, currentUser.id))
    .orderBy(desc(userInteractions.createdAt));

  return interactions.map((interaction) => ({
    id: interaction.id,
    type: interaction.type,
    context: interaction.context,
    createdAt: interaction.createdAt,
    fromUser: interaction.fromUser!,
    toUser: interaction.toUser!,
  }));
}

export interface Match {
  id: string;
  user1: Omit<UserProfile, "instruments" | "genres">;
  user2: Omit<UserProfile, "instruments" | "genres">;
  createdAt: Date;
  updatedAt: Date;
  matchScore: number;
  matchFactors: MatchScore["factors"];
}

export async function getMatch(matchId: string): Promise<Match | null> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1);

  if (!match) return null;

  const [[user1], [user2]] = await Promise.all([
    db.select().from(users).where(eq(users.id, match.user1Id)).limit(1),
    db.select().from(users).where(eq(users.id, match.user2Id)).limit(1),
  ]);

  if (!user1 || !user2) return null;

  const user1Profile = await getUserMatchProfile(user1.clerkId);
  const user2Profile = await getUserMatchProfile(user2.clerkId);

  if (!user1Profile || !user2Profile) return null;

  return {
    id: match.id,
    user1: user1,
    user2: user2,
    createdAt: match.createdAt,
    updatedAt: match.updatedAt,
    matchScore: Number(match.matchScore),
    matchFactors: match.matchFactors as MatchScore["factors"],
  };
}

export async function getMatches(clerkId: string): Promise<Match[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  // Create aliases for the users table to get both user1 and user2 data
  const user1 = alias(users, "user1");
  const user2 = alias(users, "user2");

  const myMatches = await db
    .select({
      // Match data
      id: matches.id,
      createdAt: matches.createdAt,
      updatedAt: matches.updatedAt,
      matchScore: matches.matchScore,
      matchFactors: matches.matchFactors,
      // User1 data
      user1: {
        id: user1.id,
        username: user1.username,
        displayName: user1.displayName,
        bio: user1.bio,
        age: user1.age,
        showAge: user1.showAge,
        city: user1.city,
        region: user1.region,
        country: user1.country,
        profileImageUrl: user1.profileImageUrl,
        createdAt: user1.createdAt,
        updatedAt: user1.updatedAt,
      },
      // User2 data
      user2: {
        id: user2.id,
        username: user2.username,
        displayName: user2.displayName,
        bio: user2.bio,
        age: user2.age,
        showAge: user2.showAge,
        city: user2.city,
        region: user2.region,
        country: user2.country,
        profileImageUrl: user2.profileImageUrl,
        createdAt: user2.createdAt,
        updatedAt: user2.updatedAt,
      },
    })
    .from(matches)
    .innerJoin(user1, eq(matches.user1Id, user1.id))
    .innerJoin(user2, eq(matches.user2Id, user2.id))
    .where(
      or(eq(matches.user1Id, user[0]!.id), eq(matches.user2Id, user[0]!.id)),
    )
    .orderBy(desc(matches.createdAt));

  return myMatches.map((match) => ({
    id: match.id,
    user1: {
      ...match.user1,
      showAge: true,
    },
    user2: {
      ...match.user2,
    },
    createdAt: match.createdAt,
    updatedAt: match.updatedAt,
    matchScore: Number(match.matchScore),
    matchFactors: match.matchFactors as MatchScore["factors"],
  }));
}

/**
 * Get pending collaboration invites for a user
 */
export async function getPendingInvites(clerkId: string): Promise<
  Array<{
    id: string;
    fromUser: {
      id: string;
      displayName: string;
      username: string;
      profileImageUrl: string | null;
    };
    createdAt: Date;
  }>
> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  const currentUserId = user[0]!.id;

  // Get pending invites (sent to current user, not yet completed)
  const invites = await db
    .select({
      id: userInteractions.id,
      fromUserId: userInteractions.fromUserId,
      createdAt: userInteractions.createdAt,
      fromUserDisplayName: users.displayName,
      fromUserUsername: users.username,
      fromUserProfileImage: users.profileImageUrl,
    })
    .from(userInteractions)
    .innerJoin(users, eq(userInteractions.fromUserId, users.id))
    .where(
      and(
        eq(userInteractions.toUserId, currentUserId),
        eq(userInteractions.type, "invite_sent"),
        eq(userInteractions.completed, false), // Only get uncompleted invites
      ),
    )
    .orderBy(desc(userInteractions.createdAt));

  return invites.map((invite) => ({
    id: invite.id,
    fromUser: {
      id: invite.fromUserId,
      displayName: invite.fromUserDisplayName,
      username: invite.fromUserUsername,
      profileImageUrl: invite.fromUserProfileImage,
    },
    createdAt: invite.createdAt,
  }));
}
