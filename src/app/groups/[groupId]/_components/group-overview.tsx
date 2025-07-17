import {
  Users,
  Calendar,
  MessageCircle,
  Music,
  Info,
  Crown,
  Clock,
  Activity,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getGroupById } from "@/server/groups/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function GroupOverview({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  const memberCount = group.groupMembers.length;
  const adminCount = group.groupMembers.filter(
    (member) => member.role === "admin",
  ).length;
  const recentMembers = group.groupMembers.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {memberCount}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Members
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
                <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {adminCount}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Admins
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {group.conversations.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Conversations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {Math.ceil(
                    (Date.now() - new Date(group.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Days Active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            About This Group
          </CardTitle>
        </CardHeader>
        <CardContent>
          {group.description ? (
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              {group.description}
            </p>
          ) : (
            <div className="py-6 text-center">
              <Info className="mx-auto mb-2 h-8 w-8 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">
                No description available yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Members */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={member.user.profileImageUrl ?? undefined}
                    alt={member.user.displayName || member.user.username}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    {(member.user.displayName || member.user.username)
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {member.user.displayName || member.user.username}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    @{member.user.username}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {member.role === "admin" && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    >
                      <Crown className="mr-1 h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {memberCount > 6 && (
              <div className="py-2 text-center">
                <Button variant="outline" size="sm">
                  View All {memberCount} Members
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Conversation
            </Button>
            <Button variant="outline" className="justify-start">
              <Music className="mr-2 h-4 w-4" />
              Share Music
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Event
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
