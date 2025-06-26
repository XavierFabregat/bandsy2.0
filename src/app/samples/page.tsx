import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId, getUserSamples } from "@/server/queries";
import SampleUploadZone from "../_components/sampleUploadZone";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Play, Video, Music, Clock, Plus } from "lucide-react";

export default async function SamplesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const user = await getUserByClerkId(userId);

  if (!user) {
    redirect("/sign-in");
  }

  const samples = await getUserSamples(user.id);
  console.log(samples);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Samples</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage your audio/video samples
        </p>
      </div>

      {/* Upload Section */}
      <div className="mb-8">
        <div className="bg-muted rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Plus className="h-5 w-5" />
              Add New Sample
            </h2>
          </div>
          <SampleUploadZone />
        </div>
      </div>

      {/* Samples List */}
      {samples.length > 0 ? (
        <div className="divide-border divide-y rounded-lg border">
          {samples.map((sample) => (
            <div
              key={sample.id}
              className="flex flex-col items-center gap-4 p-6 md:flex-row"
            >
              <div className="flex-shrink-0">
                {sample.fileType === "audio" ? (
                  <Music className="h-10 w-10 text-blue-500" />
                ) : (
                  <Video className="h-10 w-10 text-purple-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-lg font-medium">
                    {sample.title}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {sample.duration
                      ? `${Math.floor(sample.duration / 60)}:${(sample.duration % 60).toString().padStart(2, "0")}`
                      : "Unknown"}
                  </span>
                </div>
                <div className="text-muted-foreground truncate text-sm">
                  {sample.description}
                </div>
                <div className="mt-2">
                  {/* Media preview (audio/video) */}
                  {sample.fileType === "audio" ? (
                    <audio
                      controls
                      src={sample.fileUrl}
                      className="w-full max-w-xs"
                    />
                  ) : (
                    <video
                      controls
                      src={sample.fileUrl}
                      className="w-full max-w-xs rounded-lg"
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground py-12 text-center">
          <p>
            No samples uploaded yet. Use the upload box above to add your first
            sample!
          </p>
        </div>
      )}
    </div>
  );
}
