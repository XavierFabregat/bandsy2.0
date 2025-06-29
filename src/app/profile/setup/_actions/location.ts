"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateLocation(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const city = formData.get("city") as string;
  const region = formData.get("region") as string;
  const country = formData.get("country") as string;
  const latitude = formData.get("latitude") as string;
  const longitude = formData.get("longitude") as string;

  // Validation
  const errors: Record<string, string> = {};

  if (!city?.trim()) {
    errors.city = "City is required";
  }

  if (!region?.trim()) {
    errors.region = "State/Province is required";
  }

  if (!country?.trim()) {
    errors.country = "Country is required";
  }

  if (!latitude || !longitude) {
    errors.location = "Please select a valid location";
  }

  // If there are validation errors, redirect with errors
  if (Object.keys(errors).length > 0) {
    const errorParam = encodeURIComponent(JSON.stringify(errors));
    redirect(`/profile/setup/location?error=${errorParam}`);
  }

  try {
    // Update user location
    await db
      .update(users)
      .set({
        city: city.trim(),
        region: region.trim(),
        country: country.trim(),
        latitude: latitude,
        longitude: longitude,
      })
      .where(eq(users.clerkId, userId));

    // Revalidate the current page
    revalidatePath("/profile/setup");
  } catch (error) {
    console.error("Error updating location:", error);
    const errorParam = encodeURIComponent(
      "Failed to update location. Please try again.",
    );
    redirect(`/profile/setup/location?error=${errorParam}`);
  }

  // Redirect to next step (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect("/profile/setup/media");
}
