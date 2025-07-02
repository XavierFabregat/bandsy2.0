"use client";

import { useEffect, useState } from "react";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { NotificationBell } from "./notifications/notification-bell";

export function AuthSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        {/* Placeholder with same dimensions to prevent layout shift */}
        <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
        <div className="bg-muted h-8 w-16 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Notifications */}
      <SignedIn>
        <NotificationBell />
      </SignedIn>

      {/* User menu */}
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm font-medium">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}
