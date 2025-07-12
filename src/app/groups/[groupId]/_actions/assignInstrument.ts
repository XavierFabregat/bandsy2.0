"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function assignInstrument(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const memberId = formData.get("memberId") as string;
    const groupId = formData.get("groupId") as string;

    // TODO: Implement the actual assignment logic
    console.log(
      "Assigning instrument to member:",
      memberId,
      "in group:",
      groupId,
    );

    // Revalidate the page to show updated data
    revalidatePath(`/groups/${groupId}`);
  } catch (error) {
    console.error("Error assigning instrument:", error);
  }
}
