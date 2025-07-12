import { db } from "@/server/db";
import { conversations, groupMembers, groups, users } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, inArray } from "drizzle-orm";

export async function getMyGroups() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId));

  if (!user) throw new Error("User not found");

  // Get group IDs first
  const myGroupsIds = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, user.id));

  // Get groups without joins to avoid duplicates
  const myGroups = await db
    .select()
    .from(groups)
    .where(
      inArray(
        groups.id,
        myGroupsIds.map((g) => g.groupId),
      ),
    );

  return myGroups;
}
