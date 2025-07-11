import { db } from "@/server/db";
import {
  users,
  userInstruments,
  instruments,
  userMatchProfiles,
  userInteractions,
  matches,
  conversations,
  conversationParticipants,
  messages,
  groups,
  groupMembers,
} from "@/server/db/schema";
import { eq, and, or, not, exists, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import type {
  UserMatchProfile,
  InstrumentSkill,
} from "@/lib/matching/types/matching-types";
import {
  createLikeNotification,
  createNotification,
} from "@/server/notifications/mutations";
import {
  calculateSkillLevelAverage,
  calculateActivityScore,
  getTestLocation,
} from "@/lib/utils";
import { CompositeScorer } from "@/lib/matching/algorithms/composite-scorer";

/**
 * Create or update user match profile
 */
export async function createOrUpdateUserMatchProfile(
  clerkId: string,
  profileData?: Partial<UserMatchProfile>,
): Promise<void> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  const userId = user[0]!.id;

  // Check if profile exists
  const existingProfile = await db
    .select()
    .from(userMatchProfiles)
    .where(eq(userMatchProfiles.userId, userId))
    .limit(1);

  // Get user's instruments for computed values
  const instrumentsResult = await db
    .select({
      skillLevel: userInstruments.skillLevel,
      yearsOfExperience: userInstruments.yearsOfExperience,
      isPrimary: userInstruments.isPrimary,
      instrumentId: instruments.id,
      instrumentName: instruments.name,
      instrumentCategory: instruments.category,
    })
    .from(userInstruments)
    .leftJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
    .where(eq(userInstruments.userId, userId));

  const mockInstruments: InstrumentSkill[] = instrumentsResult.map((i) => ({
    id: i.instrumentId!,
    name: i.instrumentName!,
    category: i.instrumentCategory!,
    skillLevel: i.skillLevel as
      | "beginner"
      | "intermediate"
      | "advanced"
      | "expert",
    yearsOfExperience: i.yearsOfExperience!,
    isPrimary: i.isPrimary!,
  }));

  const skillLevelAverage = calculateSkillLevelAverage(mockInstruments);

  // Use provided location or fall back to user's location or test location
  const location =
    profileData?.location ??
    (user[0]!.latitude && user[0]!.longitude
      ? {
          latitude: parseFloat(user[0]!.latitude),
          longitude: parseFloat(user[0]!.longitude),
          city: user[0]!.city ?? undefined,
          region: user[0]!.region ?? undefined,
          country: user[0]!.country ?? undefined,
        }
      : getTestLocation(userId));

  const profileValues = {
    userId,
    locationLat: location.latitude.toString(),
    locationLng: location.longitude.toString(),
    city: location.city ?? user[0]!.city,
    region: location.region ?? user[0]!.region,
    country: location.country ?? user[0]!.country,
    searchRadius: profileData?.searchRadius ?? 50,
    ageRangeMin: profileData?.ageRange?.min ?? 18,
    ageRangeMax: profileData?.ageRange?.max ?? 65,
    lookingFor: profileData?.lookingFor ?? "any",
    skillLevelAverage: skillLevelAverage.toString(),
    activityScore:
      profileData?.activityScore ?? calculateActivityScore(new Date()),
    isActive: profileData?.isActive ?? true,
    lastActive: new Date(),
    updatedAt: new Date(),
  };

  if (existingProfile.length > 0) {
    // Update existing
    await db
      .update(userMatchProfiles)
      .set(profileValues)
      .where(eq(userMatchProfiles.userId, userId));

    console.log(`Updated match profile for user ${userId}`);
  } else {
    // Create new
    await db.insert(userMatchProfiles).values({
      ...profileValues,
      createdAt: new Date(),
    });

    console.log(
      `Created new match profile for user ${userId} at location:`,
      location,
    );
  }
}

/**
 * Check if a match should be created and create it
 */
async function detectAndCreateMatch(
  fromUserId: string,
  toUserId: string,
): Promise<boolean> {
  // Check if the target user has already liked the current user back
  const reciprocalLike = await db
    .select()
    .from(userInteractions)
    .where(
      and(
        eq(userInteractions.fromUserId, toUserId),
        eq(userInteractions.toUserId, fromUserId),
        or(
          eq(userInteractions.type, "like"),
          eq(userInteractions.type, "super_like"),
        ),
      ),
    )
    .limit(1);

  if (reciprocalLike.length === 0) {
    return false; // No mutual like yet
  }

  // Check if match already exists
  const [smallerUserId, largerUserId] = [fromUserId, toUserId].sort() as [
    string,
    string,
  ];

  const existingMatch = await db
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.user1Id, smallerUserId),
        eq(matches.user2Id, largerUserId),
      ),
    )
    .limit(1);

  if (existingMatch.length > 0) {
    return false; // Match already exists
  }

  // Create the match
  await createMatch(fromUserId, toUserId);
  return true;
}

/**
 * Create a match between two users
 */
async function createMatch(user1Id: string, user2Id: string): Promise<string> {
  // Ensure consistent ordering (smaller UUID first)
  const [orderedUser1Id, orderedUser2Id] = [user1Id, user2Id].sort() as [
    string,
    string,
  ];

  // Get both users' profile data for match scoring
  const [user1, user2] = await Promise.all([
    getUserForMatching(orderedUser1Id),
    getUserForMatching(orderedUser2Id),
  ]);

  // Calculate match score if both users have profiles
  let matchScore = 0;
  let matchFactors = {};

  if (user1 && user2) {
    try {
      const score = CompositeScorer.calculate(user1, user2);
      matchScore = score.overall;
      matchFactors = {
        location: score.factors.location,
        genres: score.factors.genres,
        instruments: score.factors.instruments,
        skillLevel: score.factors.experience,
        activity: score.factors.activity,
      };
    } catch (error) {
      console.error("Error calculating match score:", error);
    }
  }

  // Insert the match
  const [match] = await db
    .insert(matches)
    .values({
      user1Id: orderedUser1Id,
      user2Id: orderedUser2Id,
      matchScore: matchScore.toString(),
      matchFactors,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: matches.id });

  if (!match) {
    throw new Error("Failed to create match");
  }

  // Create conversation for the match
  const [conversation] = await db
    .insert(conversations)
    .values({
      matchId: match.id,
      isGroupChat: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: conversations.id });

  if (!conversation) {
    throw new Error("Failed to create conversation");
  }

  // Add both users as participants
  await db.insert(conversationParticipants).values([
    {
      conversationId: conversation.id,
      userId: orderedUser1Id,
      joinedAt: new Date(),
    },
    {
      conversationId: conversation.id,
      userId: orderedUser2Id,
      joinedAt: new Date(),
    },
  ]);

  // Send initial system message
  await db.insert(messages).values({
    conversationId: conversation.id,
    senderId: orderedUser1Id,
    type: "text",
    content: `🎵 You matched! Start the conversation and discuss your collaboration ideas.`,
    isRead: false,
    createdAt: new Date(),
  });

  // Send notifications to both users
  await Promise.all([
    createMatchNotification(match.id, orderedUser1Id, orderedUser2Id),
    createMatchNotification(match.id, orderedUser2Id, orderedUser1Id),
  ]);

  console.log(`Match created between ${orderedUser1Id} and ${orderedUser2Id}`);
  return match.id;
}

/**
 * Get user data needed for match scoring
 */
async function getUserForMatching(
  userId: string,
): Promise<UserMatchProfile | null> {
  try {
    const userResult = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        city: users.city,
        region: users.region,
        country: users.country,
        locationLat: users.latitude,
        locationLng: users.longitude,
        profileId: userMatchProfiles.id,
        searchRadius: userMatchProfiles.searchRadius,
        ageRangeMin: userMatchProfiles.ageRangeMin,
        ageRangeMax: userMatchProfiles.ageRangeMax,
        lookingFor: userMatchProfiles.lookingFor,
        isActive: userMatchProfiles.isActive,
        lastActive: userMatchProfiles.lastActive,
      })
      .from(users)
      .leftJoin(userMatchProfiles, eq(users.id, userMatchProfiles.userId))
      .where(eq(users.id, userId))
      .limit(1);

    if (!userResult.length || !userResult[0]?.profileId) {
      return null;
    }

    const user = userResult[0];

    // Get instruments and genres (simplified for matching)
    const location = {
      latitude: parseFloat(user.locationLat!) || 0,
      longitude: parseFloat(user.locationLng!) || 0,
      city: user.city ?? undefined,
      region: user.region ?? undefined,
      country: user.country ?? undefined,
    };

    return {
      id: user.profileId!,
      userId: user.id,
      location,
      genres: [], // Could enhance to get actual genres
      instruments: [], // Could enhance to get actual instruments
      skillLevelAverage: 2, // Default
      activityScore: calculateActivityScore(user.lastActive ?? new Date()),
      lastActive: user.lastActive ?? new Date(),
      isActive: user.isActive ?? true,
      searchRadius: user.searchRadius ?? 50,
      ageRange: {
        min: user.ageRangeMin ?? 18,
        max: user.ageRangeMax ?? 65,
      },
      lookingFor: (user.lookingFor as UserMatchProfile["lookingFor"]) ?? "any",
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error getting user for matching:", error);
    return null;
  }
}

/**
 * Create match notification for a user
 */
async function createMatchNotification(
  matchId: string,
  userId: string,
  otherUserId: string,
): Promise<void> {
  // Get the other user's info
  const [otherUser] = await db
    .select({
      displayName: users.displayName,
      profileImageUrl: users.profileImageUrl,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, otherUserId))
    .limit(1);

  if (!otherUser) return;

  await createNotification({
    userId,
    type: "match_created",
    data: {
      matchId,
      otherUserId,
      otherUserName: otherUser.displayName,
      otherUserImage: otherUser.profileImageUrl ?? undefined,
      otherUserDisplayName: otherUser.username,
      matchScore: undefined, // Could add match score here
    },
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  });
}

/**
 * Record user interaction for algorithm improvement
 */
export async function recordUserInteraction(
  clerkId: string,
  targetUserId: string,
  action: "like" | "pass" | "super_like" | "block",
  context: "search" | "discovery",
): Promise<{ matchCreated?: boolean; matchId?: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  const fromUserId = user[0]!.id;

  // Record the interaction
  await db.insert(userInteractions).values({
    fromUserId,
    toUserId: targetUserId,
    type: action,
    createdAt: new Date(),
    context,
  });

  let matchCreated = false;
  let matchId: string | undefined;

  // Only check for matches on likes
  if (action === "like" || action === "super_like") {
    // Send like notification
    await createLikeNotification(fromUserId, targetUserId, action);

    // Check for match
    matchCreated = await detectAndCreateMatch(fromUserId, targetUserId);

    if (matchCreated) {
      // Get the match ID for return value
      const [smallerUserId, largerUserId] = [
        fromUserId,
        targetUserId,
      ].sort() as [string, string];
      const [match] = await db
        .select({ id: matches.id })
        .from(matches)
        .where(
          and(
            eq(matches.user1Id, smallerUserId),
            eq(matches.user2Id, largerUserId),
          ),
        )
        .limit(1);

      matchId = match?.id;
    }
  }

  return { matchCreated, matchId };
}

/**
 * Send collaboration invite to a user
 */
export async function sendCollaborationInvite(
  clerkId: string,
  targetUserId: string,
  message?: string,
  context: "search" | "discovery" = "discovery",
): Promise<{ inviteId: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  const fromUserId = user[0]!.id;

  // Check if there's a pending invite (not completed)
  const existingPendingInvite = await db
    .select()
    .from(userInteractions)
    .where(
      and(
        eq(userInteractions.fromUserId, fromUserId),
        eq(userInteractions.toUserId, targetUserId),
        eq(userInteractions.type, "invite_sent"),
      ),
    )
    .limit(1);

  if (existingPendingInvite.length > 0) {
    throw new Error("Collaboration invite already sent to this user");
  }

  // Record the invite
  const [invite] = await db
    .insert(userInteractions)
    .values({
      fromUserId,
      toUserId: targetUserId,
      type: "invite_sent",
      createdAt: new Date(),
      context,
    })
    .returning({ id: userInteractions.id });

  if (!invite) {
    throw new Error("Failed to send collaboration invite");
  }

  // Send invite notification
  await createCollaborationInviteNotification(
    fromUserId,
    targetUserId,
    message,
  );

  return { inviteId: invite.id };
}

/**
 * Accept collaboration invite
 */
export async function acceptCollaborationInvite(
  clerkId: string,
  inviteId: string,
): Promise<{ matchCreated: boolean; matchId?: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  const currentUserId = user[0]!.id;

  // Get the invite
  const invite = await db
    .select()
    .from(userInteractions)
    .where(
      and(
        eq(userInteractions.id, inviteId),
        eq(userInteractions.toUserId, currentUserId),
        eq(userInteractions.type, "invite_sent"),
      ),
    )
    .limit(1);

  // update the invite to completed
  await db
    .update(userInteractions)
    .set({ completed: true })
    .where(eq(userInteractions.id, inviteId));

  if (!invite.length) {
    throw new Error("Collaboration invite not found or already processed");
  }

  const inviteData = invite[0]!;
  const senderUserId = inviteData.fromUserId;

  // Record the acceptance
  await db.insert(userInteractions).values({
    fromUserId: currentUserId,
    toUserId: senderUserId,
    type: "invite_accepted",
    createdAt: new Date(),
    context: inviteData.context,
    completed: true,
  });

  // Create the match
  const matchId = await createMatch(senderUserId, currentUserId);

  // Send acceptance notification to sender
  await createInviteAcceptedNotification(senderUserId, currentUserId);

  return { matchCreated: true, matchId };
}

/**
 * Decline collaboration invite
 */
export async function declineCollaborationInvite(
  clerkId: string,
  inviteId: string,
): Promise<{ success: boolean }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  if (!user.length) throw new Error("User not found");

  const currentUserId = user[0]!.id;

  // Get the invite
  const invite = await db
    .select()
    .from(userInteractions)
    .where(
      and(
        eq(userInteractions.id, inviteId),
        eq(userInteractions.toUserId, currentUserId),
        eq(userInteractions.type, "invite_sent"),
      ),
    )
    .limit(1);

  // update the invite to completed
  await db
    .update(userInteractions)
    .set({ completed: true })
    .where(eq(userInteractions.id, inviteId));

  if (!invite.length) {
    throw new Error("Collaboration invite not found or already processed");
  }

  const inviteData = invite[0]!;
  const senderUserId = inviteData.fromUserId;

  // Record the decline
  await db.insert(userInteractions).values({
    fromUserId: currentUserId,
    toUserId: senderUserId,
    type: "invite_declined",
    createdAt: new Date(),
    context: inviteData.context,
    completed: true,
  });

  return { success: true };
}

/**
 * Create collaboration invite notification
 */
async function createCollaborationInviteNotification(
  fromUserId: string,
  toUserId: string,
  message?: string,
): Promise<void> {
  // Get sender info
  const [sender] = await db
    .select({
      displayName: users.displayName,
      profileImageUrl: users.profileImageUrl,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, fromUserId))
    .limit(1);

  if (!sender) return;

  await createNotification({
    userId: toUserId,
    type: "collaboration_invite",
    data: {
      fromUserId,
      fromUserName: sender.displayName,
      fromUserImage: sender.profileImageUrl ?? undefined,
      fromUserUsername: sender.username,
      message,
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });
}

/**
 * Create invite accepted notification
 */
async function createInviteAcceptedNotification(
  toUserId: string,
  fromUserId: string,
): Promise<void> {
  // Get accepter info
  const [accepter] = await db
    .select({
      displayName: users.displayName,
      profileImageUrl: users.profileImageUrl,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, fromUserId))
    .limit(1);

  if (!accepter) return;

  await createNotification({
    userId: toUserId,
    type: "invite_accepted",
    data: {
      fromUserId,
      fromUserName: accepter.displayName,
      fromUserImage: accepter.profileImageUrl ?? undefined,
      fromUserUsername: accepter.username,
    },
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  });
}
