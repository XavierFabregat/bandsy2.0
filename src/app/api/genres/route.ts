import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { genres } from "@/server/db/schema";

export async function GET() {
  try {
    const allGenres = await db
      .select({
        id: genres.id,
        name: genres.name,
        parentGenreId: genres.parentGenreId,
      })
      .from(genres)
      .orderBy(genres.name);

    return NextResponse.json(allGenres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
