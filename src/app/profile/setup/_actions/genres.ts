"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { users, userGenres } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface GenreData {
  genreId: string;
  isPrimary: string;
}

export async function updateGenres(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Get the user's internal database ID
  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!user.length) {
    redirect("/");
  }

  const internalUserId = user[0]!.id;

  // Extract genre data from form
  const genres: GenreData[] = [];
  let index = 0;

  while (formData.get(`genres[${index}][genreId]`)) {
    const genreId = formData.get(`genres[${index}][genreId]`) as string;
    const isPrimary = formData.get(`genres[${index}][isPrimary]`) as string;

    if (genreId) {
      genres.push({
        genreId,
        isPrimary,
      });
    }

    index++;
  }

  // Validation
  const errors: Record<string, string> = {};

  if (genres.length === 0) {
    errors.genres = "Please select at least one genre";
  }

  // If there are validation errors, redirect with errors
  if (Object.keys(errors).length > 0) {
    const errorParam = encodeURIComponent(JSON.stringify(errors));
    redirect(`/profile/setup/genres?error=${errorParam}`);
  }

  try {
    // Clear existing genres
    await db.delete(userGenres).where(eq(userGenres.userId, internalUserId));

    // Add new genres
    if (genres.length > 0) {
      const userGenresData = genres.map((genre, index) => ({
        userId: internalUserId,
        genreId: genre.genreId,
        preference: genre.isPrimary === "true" ? 5 : Math.max(1, 5 - index), // Primary gets 5, others get decreasing values
      }));

      await db.insert(userGenres).values(userGenresData);
    }

    // Revalidate the current page
    revalidatePath("/profile/setup");
  } catch (error) {
    console.error("Error updating genres:", error);
    const errorParam = encodeURIComponent(
      "Failed to update genres. Please try again.",
    );
    redirect(`/profile/setup/genres?error=${errorParam}`);
  }

  // Redirect to next step (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect("/profile/setup/location");
}
