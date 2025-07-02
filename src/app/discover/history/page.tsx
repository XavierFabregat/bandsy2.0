import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDiscoveryHistory } from "@/server/matching/queries";
import { DiscoveryHistoryClient } from "./_components/discovery-history-client";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default async function DiscoverHistoryPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const history = await getDiscoveryHistory(userId);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Discovery History
            </h1>
            <p className="text-muted-foreground mt-2">
              View all your interactions and past discoveries
            </p>
          </div>
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{history.length}</div>
                  <div className="text-muted-foreground text-sm">
                    Total Interactions
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Suspense fallback={<HistoryLoadingSkeleton />}>
        <DiscoveryHistoryClient initialHistory={history} />
      </Suspense>
    </div>
  );
}

function HistoryLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-muted h-12 w-12 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-4 w-3/4 rounded"></div>
                <div className="bg-muted h-3 w-1/2 rounded"></div>
              </div>
              <div className="bg-muted h-6 w-16 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
