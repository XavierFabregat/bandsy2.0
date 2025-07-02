import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/server/queries";
import { NotificationSSEService } from "@/lib/notifications/sse-service";
import { createNotification } from "@/server/notifications/mutations";

export async function GET(request: NextRequest) {
  console.log("Debug notification route");
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    // Test notification
    await createNotification({
      userId: user.id,
      type: "system_update",
      data: {
        updateType: "test",
        features: ["SSE Testing"],
      },
    });

    return NextResponse.json({
      success: true,
      connectionCount: NotificationSSEService.getConnectionCount(),
      hasConnection: NotificationSSEService.hasConnection(user.id),
    });
  } catch (error) {
    console.error("Debug notification error:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 },
    );
  }
}
