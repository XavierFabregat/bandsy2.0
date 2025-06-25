"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { users, mediaSamples } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateMedia(formData: FormData) {
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

  // For now, we'll skip media upload and just mark the profile as complete
  // In a real implementation, you'd handle file uploads here

  try {
    // Mark profile as complete
    await db
      .update(users)
      .set({
        isActive: true,
      })
      .where(eq(users.clerkId, userId));

    // Revalidate the current page
    revalidatePath("/profile/setup");
  } catch (error) {
    console.error("Error completing profile:", error);
    const errorParam = encodeURIComponent(
      "Failed to complete profile. Please try again.",
    );
    redirect(`/profile/setup/media?error=${errorParam}`);
  }

  // Redirect to browse page (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect("/browse");
}
