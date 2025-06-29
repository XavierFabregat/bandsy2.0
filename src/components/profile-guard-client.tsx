"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

export function ProfileGuardClient() {
  const { userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsChecking(false);
      return;
    }

    // Skip check if already on profile setup page
    if (pathname.startsWith("/profile/setup")) {
      setIsChecking(false);
      return;
    }

    // Check profile completion
    const checkProfile = async () => {
      try {
        const response = await fetch("/api/profile/status");
        if (response.ok) {
          const profileStatus =
            (await response.json()) as ProfileCompletionStatus;

          if (!profileStatus.isComplete) {
            void router.push("/profile/setup");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking profile status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    void checkProfile();
  }, [userId, pathname, router]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-card border-border rounded-lg border p-6 text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Checking profile...</p>
        </div>
      </div>
    );
  }

  return null;
}
