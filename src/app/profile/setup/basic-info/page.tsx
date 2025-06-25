import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkProfileCompletion } from "@/lib/profile-guard";
import BasicInfoStep from "../_components/steps/basic-info-step";
import { FormError } from "../_components/form-error";

export default async function BasicInfoPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if profile is already complete
  const profileStatus = await checkProfileCompletion(userId);

  if (profileStatus.isComplete) {
    redirect("/");
  }

  return (
    <div className="from-background to-muted min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Let&apos;s get to know you better so we can find your perfect
              bandmates!
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Step Progress</span>
              <span className="font-medium">1 of 5</span>
            </div>
            <div className="bg-muted h-2 rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: "20%" }}
              />
            </div>

            <div className="mt-4 mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Profile Completion</span>
              <span className="font-medium">
                {profileStatus.completionPercentage}%
              </span>
            </div>
            <div className="bg-muted h-2 rounded-full">
              <div
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${profileStatus.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-card border-border rounded-lg border p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold">Basic Info</h2>
              <p className="text-muted-foreground">Step 1 of 5</p>
            </div>

            <FormError />
            <BasicInfoStep />
          </div>
        </div>
      </div>
    </div>
  );
}
