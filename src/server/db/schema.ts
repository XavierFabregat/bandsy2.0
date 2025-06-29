// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql, relations } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `bandsy_${name}`);

// Enums
export const skillLevelEnum = pgEnum("skill_level", [
  "beginner",
  "intermediate",
  "advanced",
  "professional",
]);
export const matchStatusEnum = pgEnum("match_status", [
  "pending",
  "accepted",
  "rejected",
]);
export const groupRoleEnum = pgEnum("group_role", ["admin", "member"]);
export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "audio",
  "image",
]);

export const interactionTypeEnum = pgEnum("interaction_type", [
  "like",
  "pass",
  "super_like",
  "block",
]);

export const interactionContextEnum = pgEnum("interaction_context", [
  "discovery",
  "search",
  "recommendation",
]);

// Users table
export const users = createTable(
  "user",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    clerkId: d.varchar({ length: 255 }).notNull().unique(),
    username: d.varchar({ length: 50 }).notNull().unique(),
    displayName: d.varchar({ length: 100 }).notNull(),
    bio: d.text(),
    age: d.integer(),
    showAge: d.boolean().default(false),
    city: d.varchar({ length: 100 }),
    region: d.varchar({ length: 100 }),
    country: d.varchar({ length: 100 }),
    latitude: d.numeric({ precision: 10, scale: 8 }),
    longitude: d.numeric({ precision: 11, scale: 8 }),
    profileImageUrl: d.varchar({ length: 500 }),
    isActive: d.boolean().default(true),
    lastActiveAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    deletedAt: d.timestamp({ withTimezone: true }), // for soft delete
  }),
  (t) => [
    index("users_clerk_id_idx").on(t.clerkId),
    index("users_location_idx").on(t.latitude, t.longitude),
    index("users_active_idx").on(t.isActive),
  ],
);

// Instruments table
export const instruments = createTable("instrument", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.varchar({ length: 100 }).notNull().unique(),
  category: d.varchar({ length: 50 }), // e.g., "string", "percussion", "wind"
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

// Genres table
export const genres = createTable("genre", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.varchar({ length: 100 }).notNull().unique(),
  parentGenreId: d.uuid(), // Will be referenced after table creation
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

// User instruments (many-to-many with skill level)
export const userInstruments = createTable(
  "user_instrument",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    instrumentId: d
      .uuid()
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    skillLevel: skillLevelEnum().notNull(),
    yearsOfExperience: d.integer(),
    isPrimary: d.boolean().default(false), // Main instrument
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("user_instruments_user_idx").on(t.userId),
    index("user_instruments_instrument_idx").on(t.instrumentId),
  ],
);

// User genres (many-to-many)
export const userGenres = createTable(
  "user_genre",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    genreId: d
      .uuid()
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
    preference: d.integer().default(1), // 1-5 scale for preference
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("user_genres_user_idx").on(t.userId),
    index("user_genres_genre_idx").on(t.genreId),
  ],
);

// Media samples (audio/video uploads)
export const mediaSamples = createTable(
  "media_sample",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    instrumentId: d.uuid().references(() => instruments.id),
    title: d.varchar({ length: 200 }).notNull(),
    description: d.text(),
    fileUrl: d.varchar({ length: 500 }).notNull(),
    fileType: d.varchar({ length: 50 }).notNull(), // "audio", "video"
    duration: d.integer(), // in seconds
    metadata: d.json(), // Additional file metadata
    isPublic: d.boolean().default(true),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("media_samples_user_idx").on(t.userId),
    index("media_samples_instrument_idx").on(t.instrumentId),
  ],
);

// Groups/Bands
export const groups = createTable("group", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.varchar({ length: 200 }).notNull(),
  description: d.text(),
  imageUrl: d.varchar({ length: 500 }),
  isActive: d.boolean().default(true),
  maxMembers: d.integer().default(10),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// Group members
export const groupMembers = createTable(
  "group_member",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    groupId: d
      .uuid()
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: groupRoleEnum().notNull().default("member"),
    instrumentId: d.uuid().references(() => instruments.id), // Primary instrument in this group
    joinedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("group_members_group_idx").on(t.groupId),
    index("group_members_user_idx").on(t.userId),
  ],
);

// Group genres
export const groupGenres = createTable(
  "group_genre",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    groupId: d
      .uuid()
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    genreId: d
      .uuid()
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("group_genres_group_idx").on(t.groupId),
    index("group_genres_genre_idx").on(t.genreId),
  ],
);

// Conversations (for matched users)
export const conversations = createTable(
  "conversation",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    matchId: d.uuid().references(() => matches.id, { onDelete: "cascade" }),
    groupId: d.uuid().references(() => groups.id, { onDelete: "cascade" }),
    isGroupChat: d.boolean().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("conversations_match_idx").on(t.matchId),
    index("conversations_group_idx").on(t.groupId),
  ],
);

// Conversation participants
export const conversationParticipants = createTable(
  "conversation_participant",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    conversationId: d
      .uuid()
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("conversation_participants_conversation_idx").on(t.conversationId),
    index("conversation_participants_user_idx").on(t.userId),
  ],
);

// Messages
export const messages = createTable(
  "message",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    conversationId: d
      .uuid()
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: messageTypeEnum().notNull(),
    content: d.text(),
    fileUrl: d.varchar({ length: 500 }), // For audio/image messages
    metadata: d.json(), // Additional message metadata
    isRead: d.boolean().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("messages_conversation_idx").on(t.conversationId),
    index("messages_sender_idx").on(t.senderId),
    index("messages_created_at_idx").on(t.createdAt),
  ],
);

// User preferences for matching
export const userPreferences = createTable(
  "user_preference",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    maxDistance: d.integer().default(50), // in km
    minAge: d.integer(),
    maxAge: d.integer(),
    skillLevels: d.json(), // Array of preferred skill levels
    isActive: d.boolean().default(true),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("user_preferences_user_idx").on(t.userId)],
);

// Swipe history (to avoid showing same profiles repeatedly)
export const swipeHistory = createTable(
  "swipe_history",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    swiperId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: d.varchar({ length: 20 }).notNull(), // "like", "pass", "super_like"
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("swipe_history_swiper_idx").on(t.swiperId),
    index("swipe_history_target_idx").on(t.targetId),
    index("swipe_history_created_at_idx").on(t.createdAt),
  ],
);

// Future tables for premium features
export const subscriptions = createTable(
  "subscription",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planType: d.varchar({ length: 50 }).notNull(), // "basic", "premium", "pro"
    status: d.varchar({ length: 20 }).notNull(), // "active", "cancelled", "expired"
    startDate: d.timestamp({ withTimezone: true }).notNull(),
    endDate: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("subscriptions_user_idx").on(t.userId),
    index("subscriptions_status_idx").on(t.status),
  ],
);

// Future table for events/gigs
export const events = createTable(
  "event",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    groupId: d
      .uuid()
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    title: d.varchar({ length: 200 }).notNull(),
    description: d.text(),
    venue: d.varchar({ length: 200 }),
    address: d.text(),
    startDate: d.timestamp({ withTimezone: true }).notNull(),
    endDate: d.timestamp({ withTimezone: true }),
    isPublic: d.boolean().default(true),
    maxAttendees: d.integer(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("events_group_idx").on(t.groupId),
    index("events_date_idx").on(t.startDate),
  ],
);

// MediaSample-Genre relations
export const mediaSampleGenres = createTable(
  "media_sample_to_genre",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    mediaSampleId: d
      .uuid()
      .references(() => mediaSamples.id, { onDelete: "cascade" }),
    genreId: d.uuid().references(() => genres.id, { onDelete: "cascade" }),
  }),
  (t) => [
    index("media_sample_to_genre_media_sample_idx").on(t.mediaSampleId),
    index("media_sample_to_genre_genre_idx").on(t.genreId),
  ],
);

// Add to your existing schema.ts file

// User matching profiles - pre-computed data for fast matching
export const userMatchProfiles = createTable(
  "user_match_profile",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Location data
    locationLat: d.numeric({ precision: 10, scale: 8 }),
    locationLng: d.numeric({ precision: 11, scale: 8 }),
    city: d.varchar({ length: 100 }),
    region: d.varchar({ length: 100 }),
    country: d.varchar({ length: 100 }),

    // Preferences
    searchRadius: d.integer().default(50), // km
    ageRangeMin: d.integer(),
    ageRangeMax: d.integer(),
    lookingFor: d.varchar({ length: 50 }).default("any"),

    // Computed scores for performance
    skillLevelAverage: d.numeric({ precision: 3, scale: 2 }),
    activityScore: d.integer().default(0),

    // Status
    isActive: d.boolean().default(true),
    lastActive: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),

    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (table) => ({
    userIdIdx: index("user_match_profile_user_id_idx").on(table.userId),
    locationIdx: index("user_match_profile_location_idx").on(
      table.locationLat,
      table.locationLng,
    ),
    activeIdx: index("user_match_profile_active_idx").on(
      table.isActive,
      table.lastActive,
    ),
  }),
);

// Track user interactions for better matching
export const userInteractions = createTable(
  "user_interaction",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    fromUserId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toUserId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: interactionTypeEnum().notNull(),
    context: interactionContextEnum().notNull(),

    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (table) => ({
    fromUserIdx: index("user_interaction_from_user_idx").on(table.fromUserId),
    toUserIdx: index("user_interaction_to_user_idx").on(table.toUserId),
    typeIdx: index("user_interaction_type_idx").on(table.type),
    uniqueInteraction: uniqueIndex("unique_user_interaction").on(
      table.fromUserId,
      table.toUserId,
      table.type,
    ),
  }),
);

// Matches when both users like each other
export const matches = createTable(
  "match",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    user1Id: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    user2Id: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Match metadata
    matchScore: d.numeric({ precision: 5, scale: 2 }),
    matchFactors: d.json(), // Store the detailed scoring breakdown

    // Status
    status: d.varchar({ length: 20 }).default("active"), // 'active', 'unmatched', 'blocked'

    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (table) => ({
    user1Idx: index("match_user1_idx").on(table.user1Id),
    user2Idx: index("match_user2_idx").on(table.user2Id),
    statusIdx: index("match_status_idx").on(table.status),
    uniqueMatch: uniqueIndex("unique_match").on(table.user1Id, table.user2Id),
  }),
);

// ============================================================================
// RELATIONS
// ============================================================================

// Users relations
export const usersRelations = relations(users, ({ one, many }) => ({
  // One-to-one relations
  preferences: one(userPreferences),

  // One-to-many relations
  userInstruments: many(userInstruments),
  userGenres: many(userGenres),
  mediaSamples: many(mediaSamples),
  groupMembers: many(groupMembers),
  conversationParticipants: many(conversationParticipants),
  messages: many(messages),
  subscriptions: many(subscriptions),

  // Match relations (as initiator)
  initiatedMatches: many(matches, { relationName: "initiator" }),
  // Match relations (as target)
  receivedMatches: many(matches, { relationName: "target" }),

  // Swipe history relations
  swipeHistory: many(swipeHistory, { relationName: "swiper" }),
  swipeHistoryTarget: many(swipeHistory, { relationName: "target" }),
}));

// Instruments relations
export const instrumentsRelations = relations(instruments, ({ many }) => ({
  userInstruments: many(userInstruments),
  mediaSamples: many(mediaSamples),
  groupMembers: many(groupMembers),
}));

// Genres relations
export const genresRelations = relations(genres, ({ one, many }) => ({
  // Self-referencing relation for sub-genres
  parentGenre: one(genres, {
    fields: [genres.parentGenreId],
    references: [genres.id],
    relationName: "subGenres",
  }),
  subGenres: many(genres, { relationName: "subGenres" }),

  // Fix: Use the junction table instead of direct relation
  mediaSampleGenres: many(mediaSampleGenres),

  // Other relations
  userGenres: many(userGenres),
  groupGenres: many(groupGenres),
}));

// User Instruments relations
export const userInstrumentsRelations = relations(
  userInstruments,
  ({ one }) => ({
    user: one(users, {
      fields: [userInstruments.userId],
      references: [users.id],
    }),
    instrument: one(instruments, {
      fields: [userInstruments.instrumentId],
      references: [instruments.id],
    }),
  }),
);

// User Genres relations
export const userGenresRelations = relations(userGenres, ({ one }) => ({
  user: one(users, {
    fields: [userGenres.userId],
    references: [users.id],
  }),
  genre: one(genres, {
    fields: [userGenres.genreId],
    references: [genres.id],
  }),
}));

// Media Samples relations
export const mediaSamplesRelations = relations(
  mediaSamples,
  ({ one, many }) => ({
    user: one(users, {
      fields: [mediaSamples.userId],
      references: [users.id],
    }),
    instrument: one(instruments, {
      fields: [mediaSamples.instrumentId],
      references: [instruments.id],
    }),
    // Fix: Use the junction table instead of direct relation
    mediaSampleGenres: many(mediaSampleGenres),
  }),
);

// Groups relations
export const groupsRelations = relations(groups, ({ many }) => ({
  groupMembers: many(groupMembers),
  groupGenres: many(groupGenres),
  conversations: many(conversations),
  events: many(events),
}));

// Group Members relations
export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
  instrument: one(instruments, {
    fields: [groupMembers.instrumentId],
    references: [instruments.id],
  }),
}));

// Group Genres relations
export const groupGenresRelations = relations(groupGenres, ({ one }) => ({
  group: one(groups, {
    fields: [groupGenres.groupId],
    references: [groups.id],
  }),
  genre: one(genres, {
    fields: [groupGenres.genreId],
    references: [genres.id],
  }),
}));

// Conversations relations
export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    match: one(matches, {
      fields: [conversations.matchId],
      references: [matches.id],
    }),
    group: one(groups, {
      fields: [conversations.groupId],
      references: [groups.id],
    }),
    participants: many(conversationParticipants),
    messages: many(messages),
  }),
);

// Conversation Participants relations
export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  }),
);

// Messages relations
export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// User Preferences relations
export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [userPreferences.userId],
      references: [users.id],
    }),
  }),
);

// Swipe History relations
export const swipeHistoryRelations = relations(swipeHistory, ({ one }) => ({
  swiper: one(users, {
    fields: [swipeHistory.swiperId],
    references: [users.id],
    relationName: "swiper",
  }),
  target: one(users, {
    fields: [swipeHistory.targetId],
    references: [users.id],
    relationName: "target",
  }),
}));

// Subscriptions relations
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// Events relations
export const eventsRelations = relations(events, ({ one }) => ({
  group: one(groups, {
    fields: [events.groupId],
    references: [groups.id],
  }),
}));

// Media Sample Genres relations (add this if not already present)
export const mediaSampleGenresRelations = relations(
  mediaSampleGenres,
  ({ one }) => ({
    mediaSample: one(mediaSamples, {
      fields: [mediaSampleGenres.mediaSampleId],
      references: [mediaSamples.id],
    }),
    genre: one(genres, {
      fields: [mediaSampleGenres.genreId],
      references: [genres.id],
    }),
  }),
);

// Relations
export const userMatchProfilesRelations = relations(
  userMatchProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [userMatchProfiles.userId],
      references: [users.id],
    }),
  }),
);

export const userInteractionsRelations = relations(
  userInteractions,
  ({ one }) => ({
    fromUser: one(users, {
      fields: [userInteractions.fromUserId],
      references: [users.id],
      relationName: "fromUserInteractions",
    }),
    toUser: one(users, {
      fields: [userInteractions.toUserId],
      references: [users.id],
      relationName: "toUserInteractions",
    }),
  }),
);

export const matchesRelations = relations(matches, ({ one }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
    relationName: "user1Matches",
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
    relationName: "user2Matches",
  }),
}));
