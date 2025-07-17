// util to check if the user is an admin of the group

import { auth } from "@clerk/nextjs/server";
import { getGroupById } from "@/server/groups/queries";

export async function isAdmin(groupId: string) {
  const { userId } = await auth();
  if (!userId) {
    return false;
  }

  const group = await getGroupById(groupId);
  if (!group) {
    return false;
  }

  return group.groupMembers.some(
    (member) => member.userId === userId && member.role === "admin",
  );
}
