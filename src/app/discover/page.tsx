import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DiscoveryInterface } from "./_components/discovery-interface";

export default async function DiscoverPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold">
          Discover Musicians
        </h1>
        <p className="text-muted-foreground mt-2">
          Find your perfect musical collaborators using our intelligent matching
          algorithm
        </p>
      </div>

      <DiscoveryInterface />
    </div>
  );
}
