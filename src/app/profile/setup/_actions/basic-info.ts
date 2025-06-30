"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface BasicInfoFormData {
  displayName: string;
  bio: string;
  age: string;
  showAge: string;
}

export async function updateBasicInfo(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Extract form data
  const displayName = formData.get("displayName") as string;
  const bio = formData.get("bio") as string;
  const age = formData.get("age") as string;
  const showAge = formData.get("showAge") === "true";

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

  // If there are validation errors, redirect with errors
  if (Object.keys(errors).length > 0) {
    const errorParam = encodeURIComponent(JSON.stringify(errors));
    redirect(`/profile/setup/basic-info?error=${errorParam}`);
  }

  try {
    // Update user profile
    await db
      .update(users)
      .set({
        displayName: displayName.trim(),
        bio: bio.trim(),
        age: ageNumber,
        showAge,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, userId));

    // Revalidate the current page
    revalidatePath("/profile/setup");
  } catch (error) {
    console.error("Error updating basic info:", error);
    const errorParam = encodeURIComponent(
      "Failed to update profile. Please try again.",
    );
    redirect(`/profile/setup/basic-info?error=${errorParam}`);
  }

  // Redirect to next step (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect("/profile/setup/instruments");
}
