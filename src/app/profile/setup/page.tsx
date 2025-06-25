import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ProfileSetupWizard } from "./_components/profile-setup-wizard";

export default async function ProfileSetupPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="from-background to-muted min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Let&apos;s get to know you better so we can find your perfect
              bandmates!
            </p>
          </div>

          <ProfileSetupWizard userId={userId} completionPercentage={0} />
        </div>
      </div>
    </div>
  );
}
