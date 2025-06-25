import { getUserByClerkId } from "@/server/queries";

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

export async function checkProfileCompletion(
  clerkId: string,
): Promise<ProfileCompletionStatus> {
  const user = await getUserByClerkId(clerkId);

  if (!user) {
    return {
      isComplete: false,
      missingFields: ["profile"],
      completionPercentage: 0,
    };
  }

  const requiredFields = ["bio", "age", "city", "region", "country"];

  const missingFields = requiredFields.filter((field) => {
    const value = user[field as keyof typeof user];
    return value === null || value === undefined || value === "";
  });

  const completionPercentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) *
      100,
  );

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
  };
}

export function getProfileSetupRedirectUrl(): string {
  return "/profile/setup";
}

export function isProfileSetupRoute(pathname: string): boolean {
  return pathname.startsWith("/profile/setup");
}
