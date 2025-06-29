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
import { eq, ne, and, desc, sql, isNull, lt, gt, not } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import type {
  UserMatchProfile,
  MatchCandidate,
  DiscoveryFilters,
  PaginationOptions,
  Location,
  GenrePreference,
  InstrumentSkill,
} from "@/lib/matching/types/matching-types";
import { CompositeScorer } from "@/lib/matching/algorithms/composite-scorer";
import { LocationScorer } from "@/lib/matching/algorithms/location-scorer";
import type { Sample } from "@/types/api";

export interface DiscoveryResult {
  candidates: MatchCandidate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  filters: DiscoveryFilters;
}

/**
 * Convert skill level string to numeric value for calculations
 */
function skillLevelToNumber(skillLevel: string): number {
  switch (skillLevel) {
    case "beginner":
      return 1;
    case "intermediate":
      return 2;
    case "advanced":
      return 3;
    case "expert":
    case "professional":
      return 4;
    default:
      return 2;
  }
}

/**
 * Calculate average skill level from instruments
 */
function calculateSkillLevelAverage(instruments: InstrumentSkill[]): number {
  if (instruments.length === 0) return 2;

  const total = instruments.reduce((sum, instrument) => {
    return sum + skillLevelToNumber(instrument.skillLevel);
  }, 0);

  return total / instruments.length;
}

/**
 * Calculate activity score based on last activity
 */
function calculateActivityScore(lastActive: Date): number {
  const daysSinceActive = Math.floor(
    (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSinceActive <= 1) return 100;
  if (daysSinceActive <= 7) return 80;
  if (daysSinceActive <= 30) return 60;
  if (daysSinceActive <= 90) return 40;
  return 20;
}

/**
 * Get varied default location for testing (based on user ID)
 */
function getTestLocation(userId: string): Location {
  const hash = userId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const locations = [
    { lat: 37.7749, lng: -122.4194, city: "San Francisco", region: "CA" },
    { lat: 37.8044, lng: -122.2712, city: "Oakland", region: "CA" },
    { lat: 40.7128, lng: -74.006, city: "New York", region: "NY" },
    { lat: 34.0522, lng: -118.2437, city: "Los Angeles", region: "CA" },
    { lat: 41.8781, lng: -87.6298, city: "Chicago", region: "IL" },
    { lat: 47.6062, lng: -122.3321, city: "Seattle", region: "WA" },
  ];

  const index = Math.abs(hash) % locations.length;
  const loc = locations[index]!;

  return {
    latitude: loc.lat,
    longitude: loc.lng,
    city: loc.city,
    region: loc.region,
    country: "United States",
  };
}

/**
 * Create or update user match profile
 */
export async function createOrUpdateUserMatchProfile(
  clerkId: string,
  profileData?: Partial<UserMatchProfile>,
): Promise<void> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  const userId = user[0]!.id;

  // Check if profile exists
  const existingProfile = await db
    .select()
    .from(userMatchProfiles)
    .where(eq(userMatchProfiles.userId, userId))
    .limit(1);

  // Get user's instruments for computed values
  const instrumentsResult = await db
    .select({
      skillLevel: userInstruments.skillLevel,
      yearsOfExperience: userInstruments.yearsOfExperience,
      isPrimary: userInstruments.isPrimary,
      instrumentId: instruments.id,
      instrumentName: instruments.name,
      instrumentCategory: instruments.category,
    })
    .from(userInstruments)
    .leftJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
    .where(eq(userInstruments.userId, userId));

  const mockInstruments: InstrumentSkill[] = instrumentsResult.map((i) => ({
    id: i.instrumentId!,
    name: i.instrumentName!,
    category: i.instrumentCategory!,
    skillLevel: i.skillLevel as
      | "beginner"
      | "intermediate"
      | "advanced"
      | "expert",
    yearsOfExperience: i.yearsOfExperience!,
    isPrimary: i.isPrimary!,
  }));

  const skillLevelAverage = calculateSkillLevelAverage(mockInstruments);

  // Use provided location or fall back to user's location or test location
  const location =
    profileData?.location ??
    (user[0]!.latitude && user[0]!.longitude
      ? {
          latitude: parseFloat(user[0]!.latitude),
          longitude: parseFloat(user[0]!.longitude),
          city: user[0]!.city ?? undefined,
          region: user[0]!.region ?? undefined,
          country: user[0]!.country ?? undefined,
        }
      : getTestLocation(userId));

  const profileValues = {
    userId,
    locationLat: location.latitude.toString(),
    locationLng: location.longitude.toString(),
    city: location.city ?? user[0]!.city,
    region: location.region ?? user[0]!.region,
    country: location.country ?? user[0]!.country,
    searchRadius: profileData?.searchRadius ?? 50,
    ageRangeMin: profileData?.ageRange?.min ?? 18,
    ageRangeMax: profileData?.ageRange?.max ?? 65,
    lookingFor: profileData?.lookingFor ?? "any",
    skillLevelAverage: skillLevelAverage.toString(),
    activityScore:
      profileData?.activityScore ?? calculateActivityScore(new Date()),
    isActive: profileData?.isActive ?? true,
    lastActive: new Date(),
    updatedAt: new Date(),
  };

  if (existingProfile.length > 0) {
    // Update existing
    await db
      .update(userMatchProfiles)
      .set(profileValues)
      .where(eq(userMatchProfiles.userId, userId));

    console.log(`Updated match profile for user ${userId}`);
  } else {
    // Create new
    await db.insert(userMatchProfiles).values({
      ...profileValues,
      createdAt: new Date(),
    });

    console.log(
      `Created new match profile for user ${userId} at location:`,
      location,
    );
  }
}

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
  // Start profiling
  const profileStart = performance.now();
  const profileData = {
    totalUsers: 0,
    processedUsers: 0,
    filteredOutUsers: 0,
    dbQueryTime: 0,
    processingTime: 0,
    scoringTime: 0,
    filteringTime: 0,
  };

  console.log(`🔍 [PROFILING] Starting discovery for user ${clerkId}`);
  console.log(`🔍 [PROFILING] Filters:`, JSON.stringify(filters, null, 2));
  console.log(`🔍 [PROFILING] Pagination:`, pagination);

  const currentUserProfile = await getUserMatchProfile(clerkId);
  if (!currentUserProfile) {
    throw new Error("User profile not found");
  }

  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  // Build discovery query with filters
  const whereConditions = [
    ne(users.clerkId, clerkId), // Exclude current user
    eq(users.isActive, true), // Only active users
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
  const dbQueryStart = performance.now();
  const candidateResults = await candidatesQuery;
  profileData.dbQueryTime = performance.now() - dbQueryStart;
  profileData.totalUsers = candidateResults.length;

  console.log(
    `🔍 [PROFILING] DB Query completed in ${profileData.dbQueryTime.toFixed(2)}ms`,
  );
  console.log(
    `🔍 [PROFILING] Retrieved ${profileData.totalUsers} candidate users`,
  );

  // Process and score candidates
  const processingStart = performance.now();
  const scoredCandidates: MatchCandidate[] = [];

  // Track individual user processing times
  const userProcessingTimes: number[] = [];

  for (const candidate of candidateResults) {
    const userStart = performance.now();

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
      const filteringStart = performance.now();
      if (locationResult.distance > maxDistance) {
        console.log(
          `Filtering out ${candidate.displayName}: ${Math.round(locationResult.distance)}km > ${maxDistance}km`,
        );
        profileData.filteredOutUsers++;
        const userTime = performance.now() - userStart;
        userProcessingTimes.push(userTime);
        profileData.filteringTime += performance.now() - filteringStart;
        continue;
      }

      // Calculate match score
      const scoringStart = performance.now();
      const matchScore = CompositeScorer.calculate(
        currentUserProfile,
        candidateProfile,
      );
      profileData.scoringTime += performance.now() - scoringStart;

      // Apply filters based on score
      if (matchScore.overall < 30) {
        console.log(
          `Filtering out ${candidate.displayName}: match score ${matchScore.overall} < 30`,
        );
        profileData.filteredOutUsers++;
        const userTime = performance.now() - userStart;
        userProcessingTimes.push(userTime);
        profileData.filteringTime += performance.now() - filteringStart;
        continue;
      }

      profileData.filteringTime += performance.now() - filteringStart;

      console.log(
        `Including ${candidate.displayName}: ${Math.round(locationResult.distance)}km, score ${matchScore.overall}`,
      );

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

      profileData.processedUsers++;
      const userTime = performance.now() - userStart;
      userProcessingTimes.push(userTime);
    } catch (error) {
      console.error("Error processing candidate:", error);
      const userTime = performance.now() - userStart;
      userProcessingTimes.push(userTime);
      continue;
    }
  }

  profileData.processingTime = performance.now() - processingStart;

  // Sort by match score (highest first)
  const sortingStart = performance.now();
  scoredCandidates.sort((a, b) => b.score.overall - a.score.overall);
  const sortingTime = performance.now() - sortingStart;

  // Apply final pagination
  const finalCandidates = scoredCandidates.slice(0, limit);

  // Calculate final metrics
  const totalTime = performance.now() - profileStart;
  const avgTimePerUser =
    userProcessingTimes.length > 0
      ? userProcessingTimes.reduce((sum, time) => sum + time, 0) /
        userProcessingTimes.length
      : 0;

  // Log comprehensive profiling results
  console.log(`\n🎯 [PROFILING RESULTS] Discovery Function Performance`);
  console.log(`┌─────────────────────────────────────────────────────────┐`);
  console.log(`│ TIMING BREAKDOWN                                        │`);
  console.log(`├─────────────────────────────────────────────────────────┤`);
  console.log(
    `│ Total Function Time:     ${totalTime.toFixed(2).padStart(8)}ms          │`,
  );
  console.log(
    `│ DB Query Time:           ${profileData.dbQueryTime.toFixed(2).padStart(8)}ms (${((profileData.dbQueryTime / totalTime) * 100).toFixed(1)}%)    │`,
  );
  console.log(
    `│ Processing Time:         ${profileData.processingTime.toFixed(2).padStart(8)}ms (${((profileData.processingTime / totalTime) * 100).toFixed(1)}%)    │`,
  );
  console.log(
    `│ Scoring Time:            ${profileData.scoringTime.toFixed(2).padStart(8)}ms (${((profileData.scoringTime / totalTime) * 100).toFixed(1)}%)    │`,
  );
  console.log(
    `│ Filtering Time:          ${profileData.filteringTime.toFixed(2).padStart(8)}ms (${((profileData.filteringTime / totalTime) * 100).toFixed(1)}%)    │`,
  );
  console.log(
    `│ Sorting Time:            ${sortingTime.toFixed(2).padStart(8)}ms (${((sortingTime / totalTime) * 100).toFixed(1)}%)    │`,
  );
  console.log(`├─────────────────────────────────────────────────────────┤`);
  console.log(`│ USER PROCESSING STATS                                   │`);
  console.log(`├─────────────────────────────────────────────────────────┤`);
  console.log(
    `│ Total Users Retrieved:   ${profileData.totalUsers.toString().padStart(8)}              │`,
  );
  console.log(
    `│ Users Processed:         ${profileData.processedUsers.toString().padStart(8)}              │`,
  );
  console.log(
    `│ Users Filtered Out:      ${profileData.filteredOutUsers.toString().padStart(8)}              │`,
  );
  console.log(
    `│ Final Candidates:        ${finalCandidates.length.toString().padStart(8)}              │`,
  );
  console.log(
    `│ Processing Success Rate: ${profileData.totalUsers > 0 ? ((profileData.processedUsers / profileData.totalUsers) * 100).toFixed(1) : "0.0"}%             │`,
  );
  console.log(`├─────────────────────────────────────────────────────────┤`);
  console.log(`│ PERFORMANCE METRICS                                     │`);
  console.log(`├─────────────────────────────────────────────────────────┤`);
  console.log(
    `│ Avg Time Per User:       ${avgTimePerUser.toFixed(2).padStart(8)}ms          │`,
  );
  console.log(
    `│ Users Per Second:        ${profileData.totalUsers > 0 ? (profileData.totalUsers / (totalTime / 1000)).toFixed(0) : "0"}              │`,
  );
  console.log(
    `│ Scoring Rate:            ${profileData.processedUsers > 0 ? (profileData.processedUsers / (profileData.scoringTime / 1000)).toFixed(0) : "0"} scores/sec     │`,
  );
  console.log(`└─────────────────────────────────────────────────────────┘`);

  // Log individual user processing times (top 5 slowest)
  if (userProcessingTimes.length > 0) {
    const sortedTimes = [...userProcessingTimes].sort((a, b) => b - a);
    console.log(`\n📊 [PROFILING] Individual User Processing Times:`);
    console.log(
      `   • Fastest: ${Math.min(...userProcessingTimes).toFixed(2)}ms`,
    );
    console.log(
      `   • Slowest: ${Math.max(...userProcessingTimes).toFixed(2)}ms`,
    );
    console.log(
      `   • Median:  ${sortedTimes[Math.floor(sortedTimes.length / 2)]?.toFixed(2) ?? "0"}ms`,
    );
    console.log(
      `   • 95th percentile: ${sortedTimes[Math.floor(sortedTimes.length * 0.05)]?.toFixed(2) ?? "0"}ms`,
    );
  }

  // Performance warnings
  if (totalTime > 5000) {
    console.warn(
      `⚠️  [PROFILING WARNING] Function took ${totalTime.toFixed(0)}ms - consider optimization`,
    );
  }
  if (avgTimePerUser > 50) {
    console.warn(
      `⚠️  [PROFILING WARNING] High per-user processing time: ${avgTimePerUser.toFixed(2)}ms`,
    );
  }
  if (profileData.dbQueryTime > totalTime * 0.5) {
    console.warn(
      `⚠️  [PROFILING WARNING] DB query is ${((profileData.dbQueryTime / totalTime) * 100).toFixed(1)}% of total time`,
    );
  }

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

/**
 * Record user interaction for algorithm improvement
 */
export async function recordUserInteraction(
  clerkId: string,
  targetUserId: string,
  action: "like" | "pass" | "super_like" | "block",
  context: "search" | "discovery",
): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  await db.insert(userInteractions).values({
    fromUserId: user[0]!.id,
    toUserId: targetUserId,
    type: action,
    createdAt: new Date(),
    context,
  });
}
