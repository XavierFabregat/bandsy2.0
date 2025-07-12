import { getMatches } from "@/server/matching/queries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MatchCard from "./_components/match-card";
import { Button } from "../../components/ui/button";
import Link from "next/link";

export default async function MatchesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const matches = await getMatches(userId);

  if (matches.length === 0) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">No matches found</h1>
        <p className="text-muted-foreground">
          You don&apos;t have any matches yet. Start matching with other users
          to find your perfect bandmate.
        </p>
        <Button asChild>
          <Link href="/discover">Search for a match</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 px-4 py-10 md:px-40">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
