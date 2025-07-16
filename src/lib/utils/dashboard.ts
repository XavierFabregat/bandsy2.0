import { db } from "@/server/db";
import {
  matches,
  groupMembers,
  messages,
  conversations,
  conversationParticipants,
  users,
  groups
} from "@/server/db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/server/queries";

export interface DashboardStats {
  newMatches: number;
  activeGroups: number;
  profileViews: number; // placeholder for now
  unreadMessages: number;
}

export interface RecentActivity {
  id: string;
  type: 'match' | 'group_join' | 'profile_view';
  title: string;
  description: string;
  timestamp: Date;
  icon: 'zap' | 'users' | 'trending-up';
  gradient: string;
}

/**
 * Get dashboard statistics for the current user
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(userId);
  if (!user) throw new Error("User not found");

  // Get stats in parallel for better performance
  const [
    newMatchesCount,
    activeGroupsCount,
    unreadMessagesCount
  ] = await Promise.all([
    getNewMatchesCount(user.id),
    getActiveGroupsCount(user.id),
    getUnreadMessagesCount(user.id)
  ]);

  return {
    newMatches: newMatchesCount,
    activeGroups: activeGroupsCount,
    profileViews: 47, // placeholder - would need analytics table
    unreadMessages: unreadMessagesCount
  };
}

/**
 * Get count of new matches in the last 7 days
 */
async function getNewMatchesCount(userId: string): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(matches)
    .where(
      and(
        eq(matches.status, "matched"),
        gte(matches.createdAt, sevenDaysAgo),
        sql`(${matches.user1Id} = ${userId} OR ${matches.user2Id} = ${userId})`
      )
    );

  return result?.count ?? 0;
}

/**
 * Get count of active groups user is a member of
 */
async function getActiveGroupsCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(
      and(
        eq(groupMembers.userId, userId),
        eq(groups.isActive, true)
      )
    );

  return result?.count ?? 0;
}

/**
 * Get count of unread messages for the user
 */
async function getUnreadMessagesCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .innerJoin(conversationParticipants, eq(messages.conversationId, conversationParticipants.conversationId))
    .where(
      and(
        eq(conversationParticipants.userId, userId),
        eq(messages.isRead, false),
        sql`${messages.senderId} != ${userId}` // Don't count own messages
      )
    );

  return result?.count ?? 0;
}

/**
 * Get recent activity for the user
 */
export async function getRecentActivity(): Promise<RecentActivity[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(userId);
  if (!user) throw new Error("User not found");

  const activities: RecentActivity[] = [];

  // Get recent matches - simplified approach
  const recentMatches = await db
    .select({
      id: matches.id,
      createdAt: matches.createdAt,
      user1Id: matches.user1Id,
      user2Id: matches.user2Id,
    })
    .from(matches)
    .where(
      and(
        eq(matches.status, "matched"),
        gte(matches.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // Last 7 days
        sql`(${matches.user1Id} = ${user.id} OR ${matches.user2Id} = ${user.id})`
      )
    )
    .orderBy(desc(matches.createdAt))
    .limit(3);

  // Add match activities
  for (const match of recentMatches) {
    const otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id;
    const otherUser = await db.select({ displayName: users.displayName }).from(users).where(eq(users.id, otherUserId)).limit(1);
    const otherUserName = otherUser[0]?.displayName ?? 'Someone';

    activities.push({
      id: `match-${match.id}`,
      type: 'match',
      title: `New match with ${otherUserName}!`,
      description: getRelativeTime(match.createdAt),
      timestamp: match.createdAt,
      icon: 'zap',
      gradient: 'from-purple-500 to-pink-500'
    });
  }

  // Get recent group joins
  const recentGroupJoins = await db
    .select({
      id: groupMembers.id,
      joinedAt: groupMembers.joinedAt,
      groupName: groups.name
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(
      and(
        eq(groupMembers.userId, user.id),
        gte(groupMembers.joinedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
      )
    )
    .orderBy(desc(groupMembers.joinedAt))
    .limit(3);

  // Add group join activities
  recentGroupJoins.forEach(groupJoin => {
    activities.push({
      id: `group-${groupJoin.id}`,
      type: 'group_join',
      title: `Joined "${groupJoin.groupName}"`,
      description: getRelativeTime(groupJoin.joinedAt),
      timestamp: groupJoin.joinedAt,
      icon: 'users',
      gradient: 'from-cyan-500 to-blue-500'
    });
  });

  // Sort by timestamp and return top 5
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);
}

/**
 * Get user display name for personalization
 */
export async function getUserDisplayName(): Promise<string> {
  const { userId } = await auth();
  if (!userId) return "Musician";

  const user = await getUserByClerkId(userId);
  return user?.displayName ?? "Musician";
}

/**
 * Helper function to format relative time
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}
