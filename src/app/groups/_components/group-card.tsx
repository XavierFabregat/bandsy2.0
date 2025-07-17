"use client";

import type { getMyGroups } from "@/server/groups/queries";
import {
  ArrowRight,
  Users,
  MessageCircle,
  Calendar,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function GroupCard({
  group,
}: {
  group: Awaited<ReturnType<typeof getMyGroups>>[number];
}) {
  const adminCount = group.groupMembers.filter(
    (member) => member.role === "admin",
  ).length;
  const memberCount = group.groupMembers.length;

  return (
    <Link href={`/groups/${group.id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600">
        {/* Header with Group Image */}
        <div className="relative h-32 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-6">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-white/20 shadow-lg">
                <AvatarImage
                  src={group.imageUrl ?? undefined}
                  alt={group.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-white/20 font-semibold text-white">
                  {group.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="line-clamp-1 text-lg font-bold text-white">
                  {group.name}
                </h3>
                <p className="line-clamp-1 text-sm text-white/80">
                  {group.description ?? "Music collaboration group"}
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-white/60 transition-all group-hover:translate-x-1 group-hover:text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {memberCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {adminCount}
                </span>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          </div>

          {/* Members Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Members
              </p>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {memberCount} total
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {group.groupMembers.slice(0, 4).map((member) => (
                  <Avatar
                    key={member.id}
                    className="h-8 w-8 border-2 border-white dark:border-slate-800"
                  >
                    <AvatarImage
                      src={member.user.profileImageUrl ?? undefined}
                      alt={member.user.displayName || member.user.username}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-xs text-white">
                      {(member.user.displayName || member.user.username)
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {memberCount > 4 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 dark:border-slate-800 dark:bg-slate-700">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      +{memberCount - 4}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                  {group.groupMembers
                    .slice(0, 2)
                    .map(
                      (member) =>
                        member.user.displayName || member.user.username,
                    )
                    .join(", ")}
                  {memberCount > 2 && ` and ${memberCount - 2} more`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">Chat</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Events</span>
            </div>
            <div className="flex-1"></div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Created {new Date(group.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
