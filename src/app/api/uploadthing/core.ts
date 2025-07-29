import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { updateUserProfileImage, uploadSample } from "@/server/mutations";
import { getUserByClerkId } from "@/server/queries";
import { db } from "@/server/db";
import { postAttachments } from "@/server/db/schema";

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
        "audio",
        file.name,
        "",
      );

      return { uploadedBy: user.id, sampleId: id };
    }),
  groupUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req: _req }) => {
      const { userId } = await auth();

      if (!userId) throw new Error("Unauthorized");

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // NOTE: Since we cannot get access to the groupID here, we will have to
      // manually update the group image URL in the database
      // after the upload is complete in the client side
      return { uploadedBy: metadata.userId, fileUrl: file.ufsUrl };
    }),
  postMediaUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 5,
    },
    video: {
      maxFileSize: "64MB",
      maxFileCount: 3,
    },
    audio: {
      maxFileSize: "32MB",
      maxFileCount: 3,
    },
  })
    .middleware(async ({ req: _req }) => {
      const { userId } = await auth();

      if (!userId) throw new Error("Unauthorized");

      const user = await getUserByClerkId(userId);
      if (!user?.id) throw new Error("User not found");

      return { userId, dbUserId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("uploaded file", file);
      // Determine file type
      const getFileType = (
        mimeType: string,
      ): "image" | "video" | "audio" | "document" => {
        if (mimeType.startsWith("image/")) return "image";
        if (mimeType.startsWith("video/")) return "video";
        if (mimeType.startsWith("audio/")) return "audio";
        return "document";
      };

      const fileType = getFileType(file.type);

      // Extract dimensions for images/videos if available
      let width: number | undefined;
      let height: number | undefined;
      let duration: number | undefined;

      // For videos and audio, duration might be available in the future
      // For now, we'll set these as undefined and can be populated later

      // Create attachment record (without postId for now - will be linked when post is created)
      console.log("file", file);
      const [attachment] = await db
        .insert(postAttachments)
        .values({
          postId: null, // Will be updated when post is created
          url: file.ufsUrl,
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
          type: fileType,
          width: width,
          height: height,
          duration: duration,
          alt: "Post media by " + metadata.userId,
          caption: null,
        })
        .returning();

      console.log(
        `Uploaded post media: ${file.name} (${fileType}) for user ${metadata.userId}`,
      );

      return {
        uploadedBy: metadata.userId,
        attachmentId: attachment?.id ?? "",
        fileUrl: file.ufsUrl,
        fileType: fileType,
        filename: file.name,
        fileSize: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
