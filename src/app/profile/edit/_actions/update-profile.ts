"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserByClerkId } from "@/server/queries";
import {
  updateUserGenres,
  updateUserInstruments,
  updateUserProfile,
} from "@/server/mutations";

export interface ProfileFormData {
  displayName: string;
  bio: string;
  age: string;
  showAge: string;
  city: string;
  region: string;
  country: string;
}

export interface InstrumentData {
  instrumentId: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "professional";
  yearsOfExperience: string;
  isPrimary: string;
}

export interface GenreData {
  genreId: string;
  isPrimary: string;
}

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the user's internal database ID
  const user = await getUserByClerkId(userId);

  if (!user) {
    redirect("/sign-in");
  }

  const internalUserId = user.id;

  // Extract basic info
  const displayName = formData.get("displayName") as string;
  const bio = formData.get("bio") as string;
  const age = formData.get("age") as string;
  const showAge = formData.get("showAge") === "true";
  const city = formData.get("city") as string;
  const region = formData.get("region") as string;
  const country = formData.get("country") as string;

  // Extract instruments
  const instruments: InstrumentData[] = [];
  let instrumentIndex = 0;
  while (formData.get(`instruments[${instrumentIndex}][instrumentId]`)) {
    const instrumentId = formData.get(
      `instruments[${instrumentIndex}][instrumentId]`,
    ) as string;
    const skillLevel = formData.get(
      `instruments[${instrumentIndex}][skillLevel]`,
    ) as string;
    const yearsOfExperience = formData.get(
      `instruments[${instrumentIndex}][yearsOfExperience]`,
    ) as string;
    const isPrimary = formData.get(
      `instruments[${instrumentIndex}][isPrimary]`,
    ) as string;

    if (instrumentId) {
      instruments.push({
        instrumentId,
        skillLevel: skillLevel as
          | "beginner"
          | "intermediate"
          | "advanced"
          | "professional",
        yearsOfExperience,
        isPrimary,
      });
    }
    instrumentIndex++;
  }

  // Extract genres
  const genres: GenreData[] = [];
  let genreIndex = 0;
  while (formData.get(`genres[${genreIndex}][genreId]`)) {
    const genreId = formData.get(`genres[${genreIndex}][genreId]`) as string;
    const isPrimary = formData.get(
      `genres[${genreIndex}][isPrimary]`,
    ) as string;

    if (genreId) {
      genres.push({
        genreId,
        isPrimary,
      });
    }
    genreIndex++;
  }

  // Validation
  const errors: Record<string, string> = {};

  if (!displayName?.trim()) {
    errors.displayName = "Display name is required";
  }

  if (!bio?.trim()) {
    errors.bio = "Bio is required";
  } else if (bio.length < 10) {
    errors.bio = "Bio must be at least 10 characters";
  }

  const ageNumber = age ? parseInt(age) : null;
  if (ageNumber !== null && (ageNumber < 13 || ageNumber > 120)) {
    errors.age = "Age must be between 13 and 120";
  }

  if (!city?.trim()) {
    errors.city = "City is required";
  }

  if (!region?.trim()) {
    errors.region = "State/Province is required";
  }

  if (!country?.trim()) {
    errors.country = "Country is required";
  }

  if (instruments.length === 0) {
    errors.instruments = "Please add at least one instrument";
  }

  if (genres.length === 0) {
    errors.genres = "Please select at least one genre";
  }

  // If there are validation errors, redirect with errors
  if (Object.keys(errors).length > 0) {
    const errorParam = encodeURIComponent(JSON.stringify(errors));
    redirect(`/profile/edit?error=${errorParam}`);
  }

  try {
    // Update basic user info
    await updateUserProfile(internalUserId, {
      displayName: displayName.trim(),
      bio: bio.trim(),
      age: ageNumber,
      showAge,
      city: city.trim(),
      region: region.trim(),
      country: country.trim(),
    });

    // Clear and update instruments
    await updateUserInstruments(
      internalUserId,
      instruments.length > 0
        ? instruments.map((instrument) => ({
            userId: internalUserId,
            instrumentId: instrument.instrumentId,
            skillLevel: instrument.skillLevel,
            yearsOfExperience: instrument.yearsOfExperience
              ? parseInt(instrument.yearsOfExperience)
              : null,
            isPrimary: instrument.isPrimary === "true",
          }))
        : [],
    );

    // Clear and update genres
    await updateUserGenres(
      internalUserId,
      genres.length > 0
        ? genres.map((genre, index) => ({
            userId: internalUserId,
            genreId: genre.genreId,
            preference: genre.isPrimary === "true" ? 5 : Math.max(1, 5 - index),
          }))
        : [],
    );

    // Revalidate the profile page
    revalidatePath("/profile");
    revalidatePath("/profile/edit");
  } catch (error) {
    console.error("Error updating profile:", error);
    const errorParam = encodeURIComponent(
      "Failed to update profile. Please try again.",
    );
    redirect(`/profile/edit?error=${errorParam}`);
  }

  // Redirect back to profile page
  redirect("/profile");
}
