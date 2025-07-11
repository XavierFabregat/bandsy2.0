import { getMatches } from "@/server/matching/queries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MatchCard from "./_components/match-card";

export default async function MatchesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const matches = await getMatches(userId);

  return (
    <div className="flex flex-wrap gap-4 px-4 py-10 md:px-40">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
