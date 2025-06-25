import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/browse",
  "/profile",
  "/groups",
  "/matches",
]);
const isProfileSetupRoute = createRouteMatcher(["/profile/setup"]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) await auth.protect();

  const { userId } = await auth();

  if (!userId) return NextResponse.next();

  // Check if user is on profile setup route
  const isOnSetupRoute = isProfileSetupRoute(request);

  // For now, we'll let the client-side handle profile completion checks
  // This avoids Edge Runtime compatibility issues with database queries
  // The profile completion check will be handled in the page components instead

  const res = NextResponse.next();

  return res;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
