import { db } from "@/server/db";
import {
  users,
  userInstruments,
  instruments,
  userMatchProfiles,
  userInteractions,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import type {
  UserMatchProfile,
  InstrumentSkill,
} from "@/lib/matching/types/matching-types";
import { createLikeNotification } from "@/server/notifications/mutations";
import {
  calculateSkillLevelAverage,
  calculateActivityScore,
  getTestLocation,
} from "@/lib/utils";

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

  if (action === "like" || action === "super_like") {
    await createLikeNotification(user[0]!.id, targetUserId, action);
  }
}
