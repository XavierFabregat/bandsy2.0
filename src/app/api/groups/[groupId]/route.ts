import { type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { groups } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { getGroupByHandle } from "../../../../server/groups/queries";

const ut = new UTApi();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { groupId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { groupId } = params;
    const body = (await request.json()) as {
      name?: string;
      imageUrl?: string;
      description?: string;
      handle?: string;
    };
    const { name, imageUrl, description, handle } = body;

    // if there is a new image, we want to check
    // if the group already has an image, if so
    // delete the old image, this happens after the
    // new image is uploaded, so we don't need to
    // worry about uploading the new image.
    if (imageUrl) {
      const group = await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
      });
      if (group?.imageUrl) {
        const urlParts = group.imageUrl.split("/");
        const fileKey = urlParts[urlParts.length - 1];
        if (fileKey) {
          await ut.deleteFiles([fileKey]);
          console.log(`Deleted old group image: ${fileKey}`);
        }
      }
    }

    // since handle update can fail for the unique constraint,
    // we need to check if the handle is already taken

    // Update group settings
    await db
      .update(groups)
      .set({
        ...(name && { name }),
        ...(imageUrl && { imageUrl }),
        ...(description && { description }),
      })
      .where(eq(groups.id, groupId));

    if (handle) {
      const existingGroup = await getGroupByHandle(handle);
      if (existingGroup) {
        return new Response("Handle already taken", { status: 400 });
      }
    }

    // here handle is unique, so we can update it
    await db
      .update(groups)
      .set({
        ...(handle && { handle }),
      })
      .where(eq(groups.id, groupId));

    return new Response("Group updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error updating group:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
