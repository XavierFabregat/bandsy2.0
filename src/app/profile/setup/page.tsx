import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { checkProfileCompletion } from "@/lib/profile-guard";

export default async function ProfileSetupPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if profile is already complete
  const profileStatus = await checkProfileCompletion(userId);

  if (profileStatus.isComplete) {
    redirect("/");
  }

  // Redirect to the first step (basic info)
  redirect("/profile/setup/basic-info");
}
