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
} from "@/lib/matching/types/matching-types";
import { CompositeScorer } from "@/lib/matching/algorithms/composite-scorer";
import { LocationScorer } from "@/lib/matching/algorithms/location-scorer";
import type { Sample } from "@/types/api";
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
