import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Get the headers
  const evt = await verifyWebhook(req);

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook received: ${eventType} for user ${id}`);

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "user.deleted":
        await handleUserDeleted(evt.data as ClerkDeletedUserData);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}

interface ClerkUserData {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  created_at: number;
  updated_at: number;
}

interface ClerkDeletedUserData {
  id: string;
  deleted: boolean;
  object: "user";
}

async function handleUserCreated(userData: ClerkUserData) {
  const { id, username, first_name, last_name, image_url, created_at } =
    userData;

  // Create display name from first and last name
  const displayName =
    [first_name, last_name].filter(Boolean).join(" ") ?? username ?? "New User";

  await db.insert(users).values({
    clerkId: id,
    username: username ?? `user_${id.slice(-8)}`,
    displayName,
    profileImageUrl: image_url,
    isActive: true,
    createdAt: new Date(created_at ?? Date.now()),
    updatedAt: new Date(created_at ?? Date.now()),
  });

  console.log(`User created in database: ${id}`);
}

async function handleUserUpdated(userData: ClerkUserData) {
  const { id, username, first_name, last_name, image_url, updated_at } =
    userData;

  // Create display name
  const displayName =
    [first_name, last_name].filter(Boolean).join(" ") ??
    username ??
    "Updated User";

  await db
    .update(users)
    .set({
      username: username ?? `user_${id.slice(-8)}`,
      displayName,
      profileImageUrl: image_url,
      updatedAt: new Date(updated_at ?? Date.now()),
    })
    .where(eq(users.clerkId, id));

  console.log(`User updated in database: ${id}`);
}

async function handleUserDeleted(userData: ClerkDeletedUserData) {
  const { id } = userData;

  // Option 1: Soft delete (recommended)
  await db
    .update(users)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, id));

  // Option 2: Hard delete (uncomment if you want to completely remove the user)
  // await db.delete(users).where(eq(users.clerkId, id));

  console.log(`User deleted from database: ${id}`);
}
