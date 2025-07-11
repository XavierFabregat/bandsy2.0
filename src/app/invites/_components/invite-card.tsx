import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import Link from "next/link";
import {
  acceptInviteAction,
  declineInviteAction,
} from "../_actions/invite-actions";

interface CollaborationInvite {
  id: string;
  fromUser: {
    id: string;
    displayName: string;
    username: string;
    profileImageUrl: string | null;
  };
  createdAt: Date;
}

export function InviteCard({ invite }: { invite: CollaborationInvite }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={invite.fromUser.profileImageUrl ?? ""} />
            <AvatarFallback>
              {invite.fromUser.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-semibold">{invite.fromUser.displayName}</h3>
              <Badge variant="outline">@{invite.fromUser.username}</Badge>
            </div>

            <p className="text-muted-foreground mb-3 text-sm">
              Wants to collaborate with you
            </p>

            <div className="text-muted-foreground mb-4 flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3" />
              {formatDate(invite.createdAt)}
            </div>

            <div className="flex gap-2">
              <form action={acceptInviteAction.bind(null, invite.id)}>
                <Button type="submit" className="flex-1" size="sm">
                  <Check className="mr-2 h-4 w-4" />
                  Accept
                </Button>
              </form>

              <form action={declineInviteAction.bind(null, invite.id)}>
                <Button
                  type="submit"
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <X className="mr-2 h-4 w-4" />
                  Decline
                </Button>
              </form>

              <Button variant="ghost" size="sm" asChild>
                <Link href={`/u/${invite.fromUser.username}`}>
                  View Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
