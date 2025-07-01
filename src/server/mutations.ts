import GeocodingService from "@/lib/services/geocoding";
import { db } from "./db";
import {
  mediaSampleGenres,
  mediaSamples,
  userGenres,
  userInstruments,
  users,
} from "./db/schema";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

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
  const geocodingService = GeocodingService.getInstance();
  const coordinatesResult = await geocodingService.getCoordinates(data.city);

  // Handle geocoding result
  let latitude: number | null = null;
  let longitude: number | null = null;

  if (!GeocodingService.isError(coordinatesResult)) {
    latitude = coordinatesResult.latitude;
    longitude = coordinatesResult.longitude;
    console.log(`Geocoding successful for city "${data.city}":`, {
      latitude,
      longitude,
    });
  } else {
    // Log the error but don't fail the entire update
    console.warn(
      `Geocoding failed for city "${data.city}":`,
      coordinatesResult.error,
    );
  }

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
      latitude: latitude?.toString(),
      longitude: longitude?.toString(),
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
  isPublic: boolean;
}

export async function updateSample(
  userId: string,
  sampleId: string,
  metadata: UpdateSampleMetadata,
) {
  await db
    .update(mediaSamples)
    .set(metadata)
    .where(and(eq(mediaSamples.id, sampleId), eq(mediaSamples.userId, userId)));

  console.log(metadata.genreIds);

  if (!metadata.genreIds) return;

  // We also need to update the genres for every genre in the metadata.genreIds
  // first we delete all the genres that sample has
  await db
    .delete(mediaSampleGenres)
    .where(and(eq(mediaSampleGenres.mediaSampleId, sampleId)));
  for (const genreId of metadata.genreIds) {
    // then we add the new genres
    console.log(`Adding genre ${genreId} to sample ${sampleId}`);
    await db.insert(mediaSampleGenres).values({
      mediaSampleId: sampleId,
      genreId,
    });
  }

  // fetch the sample and return it
  const sample = await db
    .select()
    .from(mediaSamples)
    .where(eq(mediaSamples.id, sampleId));

  return sample;
}

export async function deleteSample(userId: string, sampleId: string) {
  // first we fetch the sample
  const [sample] = await db
    .select()
    .from(mediaSamples)
    .where(and(eq(mediaSamples.id, sampleId), eq(mediaSamples.userId, userId)))
    .limit(1);

  if (!sample) {
    throw new Error("Sample not found");
  }

  // then we extract the ut id from the file url
  const utId = sample.fileUrl.split("/").pop();
  if (!utId) {
    throw new Error("Invalid file url");
  }

  // first we delete the sample from ut
  const ut = new UTApi();
  const { success, deletedCount } = await ut.deleteFiles(utId);
  if (!success || deletedCount !== 1) {
    throw new Error("Failed to delete sample from ut");
  }

  // then we delete the sample from the database
  await db
    .delete(mediaSamples)
    .where(and(eq(mediaSamples.id, sampleId), eq(mediaSamples.userId, userId)));

  return { success: true };
}
