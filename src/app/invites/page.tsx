import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPendingInvites } from "@/server/matching/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import Link from "next/link";
import { InviteCard } from "./_components/invite-card";

export default async function InvitesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const pendingInvites = await getPendingInvites(userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Collaboration Invites</h1>
        <p className="text-muted-foreground">
          Manage your pending collaboration invitations
        </p>
      </div>

      {pendingInvites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Send className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No pending invites</h3>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any collaboration invites at the moment.
            </p>
            <Button asChild>
              <Link href="/discover">Discover Musicians</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Pending Invites ({pendingInvites.length})
            </h2>
          </div>

          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <InviteCard key={invite.id} invite={invite} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
