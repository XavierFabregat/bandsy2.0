import { db } from "./db";
import { userGenres, userInstruments, users } from "./db/schema";
import { eq } from "drizzle-orm";

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
