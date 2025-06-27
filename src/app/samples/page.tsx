import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId, getUserSamples } from "@/server/queries";
import Sample from "./_components/sample";
import { Plus } from "lucide-react";
import Link from "next/link";

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
      <div className="mb-8 flex justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Samples</h1>
        <Link
          href="/samples/upload"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
        >
          <Plus className="h-5 w-5" />
          Add New Sample
        </Link>
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
