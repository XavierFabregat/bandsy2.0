import { db } from "./db";
import {
  mediaSampleGenres,
  mediaSamples,
  userGenres,
  userInstruments,
  users,
} from "./db/schema";
import { and, eq } from "drizzle-orm";

export interface UpdateUserProfileData {
  displayName: string;
  bio: string;
  age: number | null;
  showAge: boolean;
  city: string;
  region: string;
  country: string;
  updatedAt?: Date;
}

export interface UpdateUserInstrumentsData {
  userId: string;
  instrumentId: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "professional";
  yearsOfExperience: number | null;
  isPrimary: boolean;
}

export interface UpdateUserGenresData {
  userId: string;
  genreId: string;
  preference: number;
}

/**
 * Update user profile
 * @param userId - The ID of the user to update
 * @param data - The data to update the user profile with
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateUserProfileData,
) {
  await db
    .update(users)
    .set({
      displayName: data.displayName,
      bio: data.bio,
      age: data.age,
      showAge: data.showAge,
      city: data.city,
      region: data.region,
      country: data.country,
      updatedAt: data.updatedAt ?? new Date(),
    })
    .where(eq(users.id, userId));
}

/**
 * Clear and update user instruments
 * @param userId - The ID of the user to update
 * @param data - The data to update the user instruments with
 */
export async function updateUserInstruments(
  userId: string,
  data: UpdateUserInstrumentsData[],
) {
  await db.delete(userInstruments).where(eq(userInstruments.userId, userId));
  await db.insert(userInstruments).values(data);
}

/**
 * Clear and update user genres
 * @param userId - The ID of the user to update
 * @param data - The data to update the user genres with
 */
export async function updateUserGenres(
  userId: string,
  data: UpdateUserGenresData[],
) {
  await db.delete(userGenres).where(eq(userGenres.userId, userId));
  await db.insert(userGenres).values(data);
}

/**
 * Update user profile image
 * @param clerkUserId - The Clerk ID of the user to update
 * @param imageUrl - The URL of the image to update the user profile with
 */
export async function updateUserProfileImage(
  clerkUserId: string,
  imageUrl: string,
) {
  await db
    .update(users)
    .set({ profileImageUrl: imageUrl })
    .where(eq(users.clerkId, clerkUserId));
}

/**
 * Upload a sample to the database
 * @param userId - The ID of the user to upload the sample for
 * @param fileUrl - The URL of the sample file
 * @param fileType - The type of the sample file
 * @param title - The title of the sample
 * @param description - The description of the sample
 */
export async function uploadSample(
  userId: string,
  fileUrl: string,
  fileType: string,
  title: string,
  description: string,
): Promise<{ id: string }> {
  const result = await db
    .insert(mediaSamples)
    .values({
      userId,
      fileUrl,
      fileType,
      title,
      description,
    })
    .returning({
      id: mediaSamples.id,
    });

  return result[0]!;
}

export interface UpdateSampleMetadata {
  title: string;
  description: string;
  instrumentId: string;
  genreIds?: string[];
  duration: number;
  fileType?: string;
}

export async function updateSample(
  userId: string,
  sampleId: string,
  metadata: UpdateSampleMetadata,
) {
  await db
    .update(mediaSamples)
    .set({
      ...metadata,
      isPublic: true,
    })
    .where(and(eq(mediaSamples.id, sampleId), eq(mediaSamples.userId, userId)));

  if (!metadata.genreIds) return;

  // We also need to update the genres for every genre in the metadata.genreIds
  for (const genreId of metadata.genreIds) {
    await db
      .update(mediaSampleGenres)
      .set({
        genreId: genreId,
      })
      .where(eq(mediaSampleGenres.mediaSampleId, sampleId));
  }

  // fetch the sample and return it
  const sample = await db
    .select()
    .from(mediaSamples)
    .where(eq(mediaSamples.id, sampleId));

  return sample;
}
