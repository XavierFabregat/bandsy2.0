import type { getGroupById } from "@/server/groups/queries";
import { Badge } from "@/components/ui/badge";
import { Clock, Music, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { assignInstrument } from "../_actions/assignInstrument";

export default function GroupMembers({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Group Members
        </h2>
      </div>

      <div className="grid gap-4">
        {group.groupMembers.map((member) => (
          <Card key={member.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.user.profileImageUrl ?? ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {member.user.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {member.user.displayName}
                    </h3>
                  </div>

                  <div className="mt-1 flex items-center gap-4">
                    {member.instrumentId && (
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <Music className="h-4 w-4" />
                        <span>Primary Instrument</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <Badge
                  variant={member.role === "admin" ? "default" : "secondary"}
                >
                  {member.role}
                </Badge>
              </div>
              <div className="mt-10 flex justify-center">
                {member.instrumentId ? (
                  <Badge
                    variant={member.role === "admin" ? "default" : "secondary"}
                  >
                    {member.instrumentId}
                  </Badge>
                ) : (
                  <form action={assignInstrument}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <input type="hidden" name="groupId" value={group.id} />
                    <Button variant="outline" size="sm" type="submit">
                      <Plus className="h-4 w-4" />
                      Assign Instrument
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
