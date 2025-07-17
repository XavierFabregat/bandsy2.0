import Link from "next/link";
import type { getGroupById } from "@/server/groups/queries";
import {
  ArrowLeft,
  Users,
  Calendar,
  Crown,
  Shield,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import GroupSettings from "./group-settings";

export async function GroupHeader({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  const user = await auth();
  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = group.groupMembers.some(
    (member) => member.user.clerkId === user.userId && member.role === "admin",
  );

  const memberCount = group.groupMembers.length;
  const adminCount = group.groupMembers.filter(
    (member) => member.role === "admin",
  ).length;

  return (
    <div className="relative">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/20"></div>
        {group.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${group.imageUrl})` }}
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/groups">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="border-white/20 bg-white/20 text-white"
              >
                <Shield className="mr-1 h-3 w-3" />
                Admin
              </Badge>
              <GroupSettings group={group} />
            </div>
          )}
        </div>

        {/* Main Header Content */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Group Avatar and Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-white/20 shadow-2xl">
              <AvatarImage
                src={group.imageUrl ?? undefined}
                alt={group.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-white/20 text-2xl font-bold text-white">
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
                {group.name}
              </h1>
              <Link
                href={`/g/${group.handle}`}
                className="mb-4 text-lg text-white/80"
              >
                <p className="mb-4 text-lg text-white/80">@{group.handle}</p>
              </Link>
              <p className="mb-4 text-lg text-white/80">
                {group.description ?? "A collaborative music group"}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">{memberCount}</span>
                  <span className="text-sm opacity-75">members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-300" />
                  <span className="font-medium">{adminCount}</span>
                  <span className="text-sm opacity-75">admins</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm opacity-75">
                    Created {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex items-center gap-3 border-t border-white/20 pt-6">
          <Button
            variant="secondary"
            size="sm"
            className="border-white/20 bg-white/20 text-white hover:bg-white/30"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="border-white/20 bg-white/20 text-white hover:bg-white/30"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Events
          </Button>
          <div className="flex-1"></div>
          <Badge
            variant="secondary"
            className="border-green-500/20 bg-green-500/20 text-green-100"
          >
            Active
          </Badge>
        </div>
      </div>
    </div>
  );
}
