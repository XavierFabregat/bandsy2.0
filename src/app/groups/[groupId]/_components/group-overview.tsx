import {
  Users,
  Calendar,
  Plus,
  UserPlus,
  MessageCircle,
  Music,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getGroupById } from "@/server/groups/queries";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function GroupOverview({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"></div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Group Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {group.description ? (
              <p className="text-foreground text-sm">{group.description}</p>
            ) : (
              <p className="text-foreground text-sm">
                It looks like this group doesn&apos;t have a description yet.
                <br />
                You can add one by clicking the edit button.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
