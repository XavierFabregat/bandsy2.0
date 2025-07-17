import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type getGroupByHandle } from "@/server/groups/queries";
import {
  Users,
  Crown,
  Calendar,
  Info,
  Clock,
  Activity,
  Disc,
  FileText,
  Share2,
} from "lucide-react";

export function GroupPublicProfile({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupByHandle>>;
}) {
  if (!group) return null;

  const memberCount = group.groupMembers.length;
  const adminCount = group.groupMembers.filter(
    (member) => member.role === "admin",
  ).length;
  const recentMembers = group.groupMembers.slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-6 text-center">
            {/* Group Avatar */}
            <Avatar className="h-32 w-32 shadow-2xl ring-4 ring-white/20">
              <AvatarImage
                src={group.imageUrl!}
                className="h-full w-full object-cover"
              />
              <AvatarFallback className="h-full w-full bg-gradient-to-r from-purple-500 to-blue-500 text-4xl font-bold text-white">
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Group Info */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white md:text-5xl">
                {group.name}
              </h1>
              {group.description && (
                <p className="max-w-2xl text-lg text-white/90">
                  {group.description}
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold">{memberCount}</span>
                <span>Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">{adminCount}</span>
                <span>Admins</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">
                  {new Date(group.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>Created</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share Group
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                  <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {new Date(group.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Created
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                    <Disc className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      POST PLACEHOLDER
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Placeholder
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* About Section */}
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
                    This group hasn&apos;t added a description yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Members Section */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                Members ({memberCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <Avatar className="h-12 w-12">
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-slate-900 dark:text-white">
                          {member.user.displayName || member.user.username}
                        </p>
                        {member.role === "admin" && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          >
                            <Crown className="mr-1 h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                        @{member.user.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {memberCount > 8 && (
                <div className="mt-6 text-center">
                  <Button variant="outline" size="sm">
                    View All {memberCount} Members
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Section */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                Group Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Group Created
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(group.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
