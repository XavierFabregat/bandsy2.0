import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId, getUserSamples } from "@/server/queries";
import SampleUploadZone from "../_components/sampleUploadZone";
import Sample from "./_components/sample";
import { Plus } from "lucide-react";

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
        <div className="divide-border divide-y border-t border-b">
          {samples.map((sample) => (
            <Sample key={sample.id} sample={sample} />
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
