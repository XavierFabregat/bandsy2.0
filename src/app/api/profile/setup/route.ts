import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { users, userInstruments, userGenres } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { ProfileSetupData } from "@/app/profile/setup/_components/profile-setup-wizard";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ProfileSetupData;

    // Validate required fields
    if (
      !body.displayName ||
      !body.bio ||
      !body.city ||
      !body.region ||
      !body.country
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // First, get the user's internal database ID
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const internalUserId = user[0]!.id;

    // Update user profile
    await db
      .update(users)
      .set({
        displayName: body.displayName,
        bio: body.bio,
        age: body.age,
        showAge: body.showAge,
        city: body.city,
        region: body.region,
        country: body.country,
        latitude: body.latitude,
        longitude: body.longitude,
        profileImageUrl: body.profileImageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, userId));

    // Clear existing instruments and genres using internal user ID
    await db
      .delete(userInstruments)
      .where(eq(userInstruments.userId, internalUserId));
    await db.delete(userGenres).where(eq(userGenres.userId, internalUserId));

    // Add user instruments using internal user ID
    if (body.instruments.length > 0) {
      const userInstrumentsData = body.instruments.map((instrument) => ({
        userId: internalUserId,
        instrumentId: instrument.instrumentId,
        skillLevel: instrument.skillLevel,
        yearsOfExperience: instrument.yearsOfExperience,
        isPrimary: instrument.isPrimary,
      }));

      await db.insert(userInstruments).values(userInstrumentsData);
    }

    // Add user genres using internal user ID
    if (body.genres.length > 0) {
      const userGenresData = body.genres.map((genre) => ({
        userId: internalUserId,
        genreId: genre.genreId,
        preference: genre.preference,
      }));

      await db.insert(userGenres).values(userGenresData);
    }

    // TODO: Handle media samples upload
    // This would involve UploadThing integration

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
