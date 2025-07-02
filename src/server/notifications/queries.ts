import { eq, gt, isNull, or, and, desc } from "drizzle-orm";
import { notifications } from "../db/schema";
import { db } from "../db";
import type { Notification } from "@/types/notifications";

/**
 * Get user notifications with pagination
 */
export async function getUserNotifications(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    includeArchived?: boolean;
  } = {},
) {
  const {
    limit = 20,
    offset = 0,
    unreadOnly = false,
    includeArchived = false,
  } = options;

  const whereConditions = [eq(notifications.userId, userId)];

  if (unreadOnly) {
    whereConditions.push(eq(notifications.isRead, false));
  }

  if (!includeArchived) {
    whereConditions.push(eq(notifications.isArchived, false));
  }

  // Only show notifications that haven't expired
  whereConditions.push(
    or(
      isNull(notifications.expiresAt),
      gt(notifications.expiresAt, new Date()),
    )!,
  );

  const result = await db
    .select()
    .from(notifications)
    .where(and(...whereConditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  return result as Notification[];
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const result = await db
    .select({ count: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
        eq(notifications.isArchived, false),
      ),
    );

  return result.length;
}
