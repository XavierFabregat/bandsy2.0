"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Music,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Crown,
  User,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { getGroupInfoForInvite } from "@/server/groups/queries";

interface JoinGroupClientProps {
  group: Awaited<ReturnType<typeof getGroupInfoForInvite>>;
  inviteCode?: string;
}

export function JoinGroupClient({ group, inviteCode }: JoinGroupClientProps) {
  if (!group) return null;
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<"accept" | "decline" | null>(null);
  const router = useRouter();

  const handleAction = async (action: "accept" | "decline") => {
    setIsLoading(true);
    setAction(action);

    try {
      const response = await fetch(`/api/groups/${group.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          inviteCode,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        if (action === "accept") {
          toast.success(
            "Welcome to the group! You've been added successfully.",
          );
          // Redirect to the group page
          router.push(`/groups/${group.id}`);
        } else {
          toast.success("Invitation declined successfully.");
          // Redirect to groups page
          router.push("/groups");
        }
      } else {
        const error = await response.json();
        console.error("API error response:", error);
        throw new Error(
          error.error || error.message || "Failed to process invitation",
        );
      }
    } catch (error) {
      console.error("Error processing invitation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process invitation",
      );
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const adminMembers = group.groupMembers.filter(
    (member) => member.role === "admin",
  );
  const regularMembers = group.groupMembers.filter(
    (member) => member.role === "member",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/groups">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
              Group Invitation
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              You've been invited to join a music group
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-6">
          {/* Group Information Card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={group.imageUrl ?? "https://placehold.co/400x400"}
                    alt={group.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {group.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{group.name}</CardTitle>
              {group.description && (
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  {group.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Group Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {group.groupMembers.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Members
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {adminMembers.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Admins
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {group.maxMembers}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Max Size
                  </div>
                </div>
              </div>

              <Separator />

              {/* Group Members Preview */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Users className="h-4 w-4" />
                  Group Members
                </h3>
                <div className="space-y-2">
                  {adminMembers.slice(0, 3).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 p-2 dark:bg-slate-800"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user.profileImageUrl ?? ""} />
                        <AvatarFallback className="text-xs">
                          {member.user.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {member.user.displayName || "Unknown User"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          @{member.user.username}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    </div>
                  ))}
                  {regularMembers.slice(0, 2).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 p-2 dark:bg-slate-800"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user.profileImageUrl ?? ""} />
                        <AvatarFallback className="text-xs">
                          {member.user.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {member.user.displayName || "Unknown User"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          @{member.user.username}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <User className="mr-1 h-3 w-3" />
                        Member
                      </Badge>
                    </div>
                  ))}
                  {group.groupMembers.length > 5 && (
                    <p className="py-2 text-center text-xs text-slate-500">
                      +{group.groupMembers.length - 5} more members
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Group Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Music className="h-4 w-4" />
                  <span>Music Collaboration Group</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => handleAction("decline")}
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-5 w-5" />
              {isLoading && action === "decline" ? "Declining..." : "Decline"}
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={() => handleAction("accept")}
              disabled={isLoading}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              {isLoading && action === "accept" ? "Joining..." : "Join Group"}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-slate-500">
            <p>
              By joining this group, you'll be able to collaborate with other
              musicians, share music samples, and participate in group
              conversations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
