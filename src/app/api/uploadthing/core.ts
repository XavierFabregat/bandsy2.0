import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { updateUserProfileImage, uploadSample } from "@/server/mutations";
import { getUserByClerkId } from "@/server/queries";

const f = createUploadthing();
const ut = new UTApi();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  avatarUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req: _req }) => {
      // This code runs on your server before upload
      const { userId } = await auth();

      // If you throw, the user will not be able to upload
      if (!userId) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId } = metadata;
      const { ufsUrl } = file;

      try {
        // Get current user to find their existing profile image
        const user = await getUserByClerkId(userId);

        if (user?.profileImageUrl) {
          // Extract the file key from the URL
          // UploadThing URLs are typically: https://uploadthing.com/f/[fileKey]
          const urlParts = user.profileImageUrl.split("/");
          const fileKey = urlParts[urlParts.length - 1];

          if (fileKey && fileKey !== file.key) {
            // Delete the old file
            await ut.deleteFiles([fileKey]);
            console.log(`Deleted old avatar: ${fileKey}`);
          }
        }

        // Update user with new image URL
        await updateUserProfileImage(userId, ufsUrl);

        console.log(`Updated avatar for user ${userId}: ${ufsUrl}`);
      } catch (error) {
        console.error("Error updating avatar:", error);
        // Optionally delete the new file if update failed
        await ut.deleteFiles([file.key]);
        throw error;
      }

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
  sampleUploader: f({
    audio: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    video: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req: _req }) => {
      const { userId } = await auth();

      if (!userId) throw new Error("Unauthorized");

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const user = await getUserByClerkId(metadata.userId);

      if (!user?.id) throw new Error("User not found");

      const { id } = await uploadSample(
        user.id,
        file.ufsUrl,
        file.type,
        file.name,
        "",
      );

      return { uploadedBy: user.id, sampleId: id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
