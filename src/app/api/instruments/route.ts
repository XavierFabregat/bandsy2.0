import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { instruments } from "@/server/db/schema";

export async function GET() {
  try {
    const allInstruments = await db
      .select({
        id: instruments.id,
        name: instruments.name,
        category: instruments.category,
      })
      .from(instruments)
      .orderBy(instruments.name);

    return NextResponse.json(allInstruments);
  } catch (error) {
    console.error("Error fetching instruments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
