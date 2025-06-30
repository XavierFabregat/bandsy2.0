import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import {
  getUserByClerkId,
  getInstruments,
  getGenres,
  getSample,
} from "@/server/queries";
import { EditSampleForm } from "./_components/edit-sample-form";

export default async function EditSamplePage({
  params,
}: {
  params: Promise<{ sampleId: string }>;
}) {
  const { userId } = await auth();
  const { sampleId } = await params;

  if (!userId) {
    redirect("/");
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    redirect("/");
  }

  const [sample, instruments, genres] = await Promise.all([
    getSample(user.id, sampleId),
    getInstruments(),
    getGenres(),
  ]);

  if (!sample) {
    notFound();
  }

  return (
    <div className="from-background via-background to-muted/10 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Sample</h1>
          <p className="text-muted-foreground mt-2">
            Update your sample information and metadata
          </p>
        </div>

        {/* Edit Form */}
        <div className="mx-auto max-w-2xl">
          <EditSampleForm
            sample={sample}
            instruments={instruments}
            genres={genres}
          />
        </div>
      </div>
    </div>
  );
}
