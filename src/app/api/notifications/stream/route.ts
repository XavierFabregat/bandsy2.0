import { type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/server/queries";
import type { Notification } from "@/types/notifications";
import { NotificationSSEService } from "@/lib/notifications/sse-service";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  // Create a readable stream that stays open
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Create a proper writer that matches the expected interface
      const writer = {
        write: async (data: Uint8Array) => {
          try {
            controller.enqueue(data);
          } catch (error) {
            console.error("SSE: Controller enqueue failed:", error);
            throw error;
          }
        },
      };

      // Send initial connection event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sendMessage = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(message));
          return true;
        } catch (error) {
          console.error("SSE: Failed to send message:", error);
          return false;
        }
      };

      // Send connection confirmation
      sendMessage({
        type: "connected",
        timestamp: new Date().toISOString(),
      });

      // Store connection in the service
      NotificationSSEService.addConnection(user.id, writer);

      // Cleanup function
      const cleanup = () => {
        NotificationSSEService.removeConnection(user.id);

        try {
          controller.close();
        } catch (error) {
          console.error("SSE: Error closing controller:", error);
        }
      };

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        cleanup();
      });

      // Return cleanup function (this is important!)
      return cleanup;
    },

    // Handle stream cancellation
    cancel() {
      NotificationSSEService.removeConnection(user.id);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

// Function to send notification to specific user
export function sendNotificationToUser(
  userId: string,
  notification: Notification,
) {
  const connection = NotificationSSEService.getConnection(userId);
  if (connection) {
    const data = `data: ${JSON.stringify({
      type: "notification",
      notification,
      timestamp: new Date().toISOString(),
    })}\n\n`;

    try {
      void connection.write(new TextEncoder().encode(data));
    } catch (error) {
      console.error("Failed to send notification:", error);
      NotificationSSEService.removeConnection(userId);
    }
  }
}

// Function to broadcast unread count update
export function sendUnreadCountUpdate(userId: string, count: number) {
  const connection = NotificationSSEService.getConnection(userId);
  if (connection) {
    const data = `data: ${JSON.stringify({
      type: "unread_count",
      count,
      timestamp: new Date().toISOString(),
    })}\n\n`;

    try {
      void connection.write(new TextEncoder().encode(data));
    } catch (error) {
      console.error("Failed to send unread count:", error);
      NotificationSSEService.removeConnection(userId);
    }
  }
}
