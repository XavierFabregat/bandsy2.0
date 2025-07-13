"use server";

import { auth } from "@clerk/nextjs/server";

export async function createGroupChat(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const groupId = formData.get("groupId") as string;
  const name = formData.get("name") as string;

  console.log("Creating group chat with name", name, "for group", groupId);
}
