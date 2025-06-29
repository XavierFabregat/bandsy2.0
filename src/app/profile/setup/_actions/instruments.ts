"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { users, userInstruments } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface InstrumentData {
  instrumentId: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "professional";
  yearsOfExperience: string;
  isPrimary: string;
}

export async function updateInstruments(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the user's internal database ID
  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!user.length) {
    redirect("/sign-in");
  }

  const internalUserId = user[0]!.id;

  // Extract instrument data from form
  const instruments: InstrumentData[] = [];
  let index = 0;

  while (formData.get(`instruments[${index}][instrumentId]`)) {
    const instrumentId = formData.get(
      `instruments[${index}][instrumentId]`,
    ) as string;
    const skillLevel = formData.get(
      `instruments[${index}][skillLevel]`,
    ) as string;
    const yearsOfExperience = formData.get(
      `instruments[${index}][yearsOfExperience]`,
    ) as string;
    const isPrimary = formData.get(
      `instruments[${index}][isPrimary]`,
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

    index++;
  }

  // Validation
  const errors: Record<string, string> = {};

  if (instruments.length === 0) {
    errors.instruments = "Please add at least one instrument";
  }

  instruments.forEach((instrument, index) => {
    if (!instrument.instrumentId) {
      errors[`instrument-${index}`] = "Please select an instrument";
    }
  });

  // If there are validation errors, redirect with errors
  if (Object.keys(errors).length > 0) {
    const errorParam = encodeURIComponent(JSON.stringify(errors));
    redirect(`/profile/setup/instruments?error=${errorParam}`);
  }

  try {
    // Clear existing instruments
    await db
      .delete(userInstruments)
      .where(eq(userInstruments.userId, internalUserId));

    // Add new instruments
    if (instruments.length > 0) {
      const userInstrumentsData = instruments.map((instrument) => ({
        userId: internalUserId,
        instrumentId: instrument.instrumentId,
        skillLevel: instrument.skillLevel,
        yearsOfExperience: instrument.yearsOfExperience
          ? parseInt(instrument.yearsOfExperience)
          : null,
        isPrimary: instrument.isPrimary === "true",
      }));

      await db.insert(userInstruments).values(userInstrumentsData);
    }

    // Revalidate the current page
    revalidatePath("/profile/setup");
  } catch (error) {
    console.error("Error updating instruments:", error);
    const errorParam = encodeURIComponent(
      "Failed to update instruments. Please try again.",
    );
    redirect(`/profile/setup/instruments?error=${errorParam}`);
  }

  // Redirect to next step (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect("/profile/setup/genres");
}
