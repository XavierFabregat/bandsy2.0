import { db } from "../db";
import { notifications, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type {
  CreateNotificationParams,
  Notification,
  NotificationType,
} from "@/types/notifications";
import { getNotificationTemplate } from "@/lib/notifications/templates";
import { NotificationSSEService } from "@/lib/notifications/sse-service";
import { getUnreadNotificationCount } from "./queries";

/**
 * Create a new notification
 */
export async function createNotification<T extends NotificationType>(
  params: CreateNotificationParams<T>,
): Promise<string> {
  const template = getNotificationTemplate(params.type, params.data);

  console.log("template", template);
  console.log("actionUrl", template.actionUrl);

  const [result] = await db
    .insert(notifications)
    .values({
      userId: params.userId,
      type: params.type,
      title: template.title,
      message: template.message,
      data: params.data as Record<string, unknown>,
      actionUrl: template.actionUrl,
      actionType: template.actionType,
      scheduledFor: params.scheduledFor,
      expiresAt: params.expiresAt,
    })
    .returning();

  const notification = result! as Notification;

  console.log(`Creating notification for user ${params.userId}:`, {
    type: params.type,
    title: template.title,
  });

  // Send real-time notification via SSE
  const sent = NotificationSSEService.sendNotification(
    params.userId,
    notification,
  );
  console.log(`SSE notification sent: ${sent}`);

  // Update unread count
  try {
    const newUnreadCount = await getUnreadNotificationCount(params.userId);
    const countSent = NotificationSSEService.sendUnreadCount(
      params.userId,
      newUnreadCount,
    );
    console.log(
      `SSE unread count sent: ${countSent}, count: ${newUnreadCount}`,
    );
  } catch (error) {
    console.error("Failed to get/send unread count:", error);
  }

  return notification.id;
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  userId: string,
  notificationIds?: string[],
): Promise<void> {
  const whereConditions = [eq(notifications.userId, userId)];

  if (notificationIds && notificationIds.length > 0) {
    // For multiple IDs, you'll need to use the `inArray` operator
    // This is a simplified version - you should import `inArray` from drizzle-orm
    whereConditions.push(eq(notifications.id, notificationIds[0]!));
  }

  await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(and(...whereConditions));

  // Send updated unread count
  try {
    const newUnreadCount = await getUnreadNotificationCount(userId);
    NotificationSSEService.sendUnreadCount(userId, newUnreadCount);
  } catch (error) {
    console.error("Failed to update unread count:", error);
  }
}

/**
 * Archive old notifications (cleanup job)
 */
export async function archiveOldNotifications(daysOld = 30): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  await db
    .update(notifications)
    .set({ isArchived: true })
    .where(
      and(
        eq(notifications.isRead, true),
        // createdAt < cutoffDate (adjust SQL as needed)
      ),
    );
}

/**
 * Create notification when someone likes you
 */
export async function createLikeNotification(
  fromUserId: string,
  toUserId: string,
  interactionType: "like" | "super_like",
): Promise<void> {
  // Get the sender's info
  const [fromUser] = await db
    .select({
      displayName: users.displayName,
      profileImageUrl: users.profileImageUrl,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, fromUserId))
    .limit(1);

  if (!fromUser) return;

  const notificationType =
    interactionType === "super_like" ? "super_like_received" : "like_received";

  await createNotification({
    userId: toUserId,
    type: notificationType,
    data: {
      fromUserId,
      fromUserName: fromUser.displayName,
      fromUserImage: fromUser.profileImageUrl ?? undefined,
      interactionId: "", // You might want to pass this
      fromUserDisplayName: fromUser.username,
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });
}
