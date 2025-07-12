import { db } from "@/server/db";
import { conversations, groupMembers, groups, users } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, inArray } from "drizzle-orm";
import { getUserByClerkId } from "../queries";

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

export async function getGroupById(groupId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(userId);

  if (!user) throw new Error("User not found");

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
    with: {
      groupMembers: {
        with: {
          user: true,
        },
      },
      conversations: {
        with: {
          participants: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!group) throw new Error("Group not found");

  //check if user is member of group
  const isMember = group.groupMembers.some(
    (member) => member.userId === user.id,
  );

  if (!isMember) throw new Error("User is not a member of this group");

  return group;
}
