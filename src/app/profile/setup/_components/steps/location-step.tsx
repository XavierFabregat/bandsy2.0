import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { LocationForm } from "../location-form";

export default async function LocationStep() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Fetch user location data
  const user = await db
    .select({
      city: users.city,
      region: users.region,
      country: users.country,
      latitude: users.latitude,
      longitude: users.longitude,
    })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  const userLocation = user[0] ?? {
    city: null,
    region: null,
    country: null,
    latitude: null,
    longitude: null,
  };

  return <LocationForm userLocation={userLocation} />;
}
