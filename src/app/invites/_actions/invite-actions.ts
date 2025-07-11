"use server";

import { auth } from "@clerk/nextjs/server";
import {
  acceptCollaborationInvite,
  declineCollaborationInvite,
} from "@/server/matching/mutations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function acceptInviteAction(inviteId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await acceptCollaborationInvite(userId, inviteId);

    // Revalidate the invites page to show updated data
    revalidatePath("/invites");

    // If a match was created, redirect to the match page
    if (result.matchCreated && result.matchId) {
      redirect(`/matches/${result.matchId}`);
    }
  } catch (error) {
    console.error("Failed to accept invite:", error);
    throw error;
  }
}

export async function declineInviteAction(inviteId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await declineCollaborationInvite(userId, inviteId);

    // Revalidate the invites page to show updated data
    revalidatePath("/invites");
  } catch (error) {
    console.error("Failed to decline invite:", error);
    throw error;
  }
}
