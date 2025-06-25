import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkProfileCompletion } from "@/lib/profile-guard";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileStatus = await checkProfileCompletion(userId);

    return NextResponse.json(profileStatus);
  } catch (error) {
    console.error("Error checking profile status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
