CREATE TYPE "public"."group_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'audio', 'image');--> statement-breakpoint
CREATE TYPE "public"."skill_level" AS ENUM('beginner', 'intermediate', 'advanced', 'professional');--> statement-breakpoint
CREATE TABLE "bandsy_conversation_participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversationId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"joinedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandsy_conversation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"matchId" uuid,
	"groupId" uuid,
	"isGroupChat" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "bandsy_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"groupId" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"venue" varchar(200),
	"address" text,
	"startDate" timestamp with time zone NOT NULL,
	"endDate" timestamp with time zone,
	"isPublic" boolean DEFAULT true,
	"maxAttendees" integer,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandsy_genre" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"parentGenreId" uuid,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "bandsy_genre_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "bandsy_group_genre" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"groupId" uuid NOT NULL,
	"genreId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandsy_group_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"groupId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" "group_role" DEFAULT 'member' NOT NULL,
	"instrumentId" uuid,
	"joinedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandsy_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"imageUrl" varchar(500),
	"isActive" boolean DEFAULT true,
	"maxMembers" integer DEFAULT 10,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "bandsy_instrument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50),
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "bandsy_instrument_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "bandsy_match" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"initiatorId" uuid NOT NULL,
	"targetId" uuid NOT NULL,
	"status" "match_status" NOT NULL,
	"initiatorMessage" text,
	"matchedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandsy_media_sample" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"instrumentId" uuid,
	"title" varchar(200) NOT NULL,
	"description" text,
	"fileUrl" varchar(500) NOT NULL,
	"fileType" varchar(50) NOT NULL,
	"duration" integer,
	"metadata" json,
	"isPublic" boolean DEFAULT true,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandsy_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversationId" uuid NOT NULL,
	"senderId" uuid NOT NULL,
	"type" "message_type" NOT NULL,
	"content" text,
	"fileUrl" varchar(500),
	"metadata" json,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandsy_subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"planType" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"startDate" timestamp with time zone NOT NULL,
	"endDate" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandsy_swipe_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"swiperId" uuid NOT NULL,
	"targetId" uuid NOT NULL,
	"action" varchar(20) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandsy_user_genre" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"genreId" uuid NOT NULL,
	"preference" integer DEFAULT 1,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandsy_user_instrument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"instrumentId" uuid NOT NULL,
	"skillLevel" "skill_level" NOT NULL,
	"yearsOfExperience" integer,
	"isPrimary" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandsy_user_preference" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"maxDistance" integer DEFAULT 50,
	"minAge" integer,
	"maxAge" integer,
	"skillLevels" json,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "bandsy_user_preference_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "bandsy_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerkId" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"displayName" varchar(100) NOT NULL,
	"bio" text,
	"age" integer,
	"showAge" boolean DEFAULT false,
	"city" varchar(100),
	"region" varchar(100),
	"country" varchar(100),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"profileImageUrl" varchar(500),
	"isActive" boolean DEFAULT true,
	"lastActiveAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "bandsy_user_clerkId_unique" UNIQUE("clerkId"),
	CONSTRAINT "bandsy_user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "bandsy_conversation_participant" ADD CONSTRAINT "bandsy_conversation_participant_conversationId_bandsy_conversation_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."bandsy_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_conversation_participant" ADD CONSTRAINT "bandsy_conversation_participant_userId_bandsy_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_conversation" ADD CONSTRAINT "bandsy_conversation_matchId_bandsy_match_id_fk" FOREIGN KEY ("matchId") REFERENCES "public"."bandsy_match"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_conversation" ADD CONSTRAINT "bandsy_conversation_groupId_bandsy_group_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."bandsy_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_event" ADD CONSTRAINT "bandsy_event_groupId_bandsy_group_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."bandsy_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_group_genre" ADD CONSTRAINT "bandsy_group_genre_groupId_bandsy_group_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."bandsy_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_group_genre" ADD CONSTRAINT "bandsy_group_genre_genreId_bandsy_genre_id_fk" FOREIGN KEY ("genreId") REFERENCES "public"."bandsy_genre"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_group_member" ADD CONSTRAINT "bandsy_group_member_groupId_bandsy_group_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."bandsy_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_group_member" ADD CONSTRAINT "bandsy_group_member_userId_bandsy_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_group_member" ADD CONSTRAINT "bandsy_group_member_instrumentId_bandsy_instrument_id_fk" FOREIGN KEY ("instrumentId") REFERENCES "public"."bandsy_instrument"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_match" ADD CONSTRAINT "bandsy_match_initiatorId_bandsy_user_id_fk" FOREIGN KEY ("initiatorId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_match" ADD CONSTRAINT "bandsy_match_targetId_bandsy_user_id_fk" FOREIGN KEY ("targetId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_media_sample" ADD CONSTRAINT "bandsy_media_sample_userId_bandsy_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_media_sample" ADD CONSTRAINT "bandsy_media_sample_instrumentId_bandsy_instrument_id_fk" FOREIGN KEY ("instrumentId") REFERENCES "public"."bandsy_instrument"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_message" ADD CONSTRAINT "bandsy_message_conversationId_bandsy_conversation_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."bandsy_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_message" ADD CONSTRAINT "bandsy_message_senderId_bandsy_user_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_subscription" ADD CONSTRAINT "bandsy_subscription_userId_bandsy_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_swipe_history" ADD CONSTRAINT "bandsy_swipe_history_swiperId_bandsy_user_id_fk" FOREIGN KEY ("swiperId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_swipe_history" ADD CONSTRAINT "bandsy_swipe_history_targetId_bandsy_user_id_fk" FOREIGN KEY ("targetId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_user_genre" ADD CONSTRAINT "bandsy_user_genre_userId_bandsy_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_user_genre" ADD CONSTRAINT "bandsy_user_genre_genreId_bandsy_genre_id_fk" FOREIGN KEY ("genreId") REFERENCES "public"."bandsy_genre"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_user_instrument" ADD CONSTRAINT "bandsy_user_instrument_userId_bandsy_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_user_instrument" ADD CONSTRAINT "bandsy_user_instrument_instrumentId_bandsy_instrument_id_fk" FOREIGN KEY ("instrumentId") REFERENCES "public"."bandsy_instrument"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandsy_user_preference" ADD CONSTRAINT "bandsy_user_preference_userId_bandsy_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bandsy_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversation_participants_conversation_idx" ON "bandsy_conversation_participant" USING btree ("conversationId");--> statement-breakpoint
CREATE INDEX "conversation_participants_user_idx" ON "bandsy_conversation_participant" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "conversations_match_idx" ON "bandsy_conversation" USING btree ("matchId");--> statement-breakpoint
CREATE INDEX "conversations_group_idx" ON "bandsy_conversation" USING btree ("groupId");--> statement-breakpoint
CREATE INDEX "events_group_idx" ON "bandsy_event" USING btree ("groupId");--> statement-breakpoint
CREATE INDEX "events_date_idx" ON "bandsy_event" USING btree ("startDate");--> statement-breakpoint
CREATE INDEX "group_genres_group_idx" ON "bandsy_group_genre" USING btree ("groupId");--> statement-breakpoint
CREATE INDEX "group_genres_genre_idx" ON "bandsy_group_genre" USING btree ("genreId");--> statement-breakpoint
CREATE INDEX "group_members_group_idx" ON "bandsy_group_member" USING btree ("groupId");--> statement-breakpoint
CREATE INDEX "group_members_user_idx" ON "bandsy_group_member" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "matches_initiator_idx" ON "bandsy_match" USING btree ("initiatorId");--> statement-breakpoint
CREATE INDEX "matches_target_idx" ON "bandsy_match" USING btree ("targetId");--> statement-breakpoint
CREATE INDEX "matches_status_idx" ON "bandsy_match" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_samples_user_idx" ON "bandsy_media_sample" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "media_samples_instrument_idx" ON "bandsy_media_sample" USING btree ("instrumentId");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "bandsy_message" USING btree ("conversationId");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "bandsy_message" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "bandsy_message" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "subscriptions_user_idx" ON "bandsy_subscription" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "bandsy_subscription" USING btree ("status");--> statement-breakpoint
CREATE INDEX "swipe_history_swiper_idx" ON "bandsy_swipe_history" USING btree ("swiperId");--> statement-breakpoint
CREATE INDEX "swipe_history_target_idx" ON "bandsy_swipe_history" USING btree ("targetId");--> statement-breakpoint
CREATE INDEX "swipe_history_created_at_idx" ON "bandsy_swipe_history" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "user_genres_user_idx" ON "bandsy_user_genre" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_genres_genre_idx" ON "bandsy_user_genre" USING btree ("genreId");--> statement-breakpoint
CREATE INDEX "user_instruments_user_idx" ON "bandsy_user_instrument" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_instruments_instrument_idx" ON "bandsy_user_instrument" USING btree ("instrumentId");--> statement-breakpoint
CREATE INDEX "user_preferences_user_idx" ON "bandsy_user_preference" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "users_clerk_id_idx" ON "bandsy_user" USING btree ("clerkId");--> statement-breakpoint
CREATE INDEX "users_location_idx" ON "bandsy_user" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "users_active_idx" ON "bandsy_user" USING btree ("isActive");