"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  X,
  Star,
  Shield,
  Search,
  Filter,
  Calendar,
  User,
  type LucideIcon,
  Mail,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DiscoveryHistory } from "@/lib/matching/types/matching-types";

interface Props {
  initialHistory: DiscoveryHistory[];
}

const interactionConfig: Record<
  | "like"
  | "super_like"
  | "pass"
  | "block"
  | "invite_sent"
  | "invite_accepted"
  | "invite_declined",
  {
    icon: LucideIcon;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }
> = {
  like: {
    icon: Heart,
    label: "Liked",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    description: "You liked this musician",
  },
  super_like: {
    icon: Star,
    label: "Super Liked",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    description: "You super liked this musician",
  },
  pass: {
    icon: X,
    label: "Passed",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    description: "You passed on this musician",
  },
  block: {
    icon: Shield,
    label: "Blocked",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "You blocked this musician",
  },
  invite_sent: {
    icon: Mail,
    label: "Invite Sent",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "You sent an invite to this musician",
  },
  invite_accepted: {
    icon: Mail,
    label: "Invite Accepted",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "You accepted an invite from this musician",
  },
  invite_declined: {
    icon: Mail,
    label: "Invite Declined",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "You declined an invite from this musician",
  },
};

export function DiscoveryHistoryClient({ initialHistory }: Props) {
  const [filter, setFilter] = useState<
    "all" | "like" | "super_like" | "pass" | "block"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = useMemo(() => {
    let filtered = initialHistory;

    // Filter by type
    if (filter !== "all") {
      filtered = filtered.filter((item) => item.type === filter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.toUser.displayName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.toUser.username
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [initialHistory, filter, searchQuery]);

  const stats = useMemo(() => {
    const likes = initialHistory.filter((h) => h.type === "like").length;
    const superLikes = initialHistory.filter(
      (h) => h.type === "super_like",
    ).length;
    const passes = initialHistory.filter((h) => h.type === "pass").length;
    const blocks = initialHistory.filter((h) => h.type === "block").length;

    return { likes, superLikes, passes, blocks };
  }, [initialHistory]);

  const StatCard = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) => (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4 text-center">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-muted-foreground text-sm">{label}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Likes" value={stats.likes} color="text-pink-600" />
        <StatCard
          label="Super Likes"
          value={stats.superLikes}
          color="text-yellow-600"
        />
        <StatCard label="Passes" value={stats.passes} color="text-gray-600" />
        <StatCard label="Blocks" value={stats.blocks} color="text-red-600" />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Filter className="text-muted-foreground h-5 w-5" />
              <span className="font-medium">Filter & Search</span>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="bg-background w-full rounded-md border py-2 pr-4 pl-10 md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={filter}
            onValueChange={(value) =>
              setFilter(
                value as "all" | "like" | "super_like" | "pass" | "block",
              )
            }
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="like">Likes</TabsTrigger>
              <TabsTrigger value="super_like">Super</TabsTrigger>
              <TabsTrigger value="pass">Passes</TabsTrigger>
              <TabsTrigger value="block">Blocked</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <User className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <h3 className="mb-2 text-lg font-medium">
                  No interactions found
                </h3>
                <p>
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "Start discovering musicians to see your interaction history"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((interaction) => {
            const config = interactionConfig[interaction.type];
            const Icon = config.icon;

            return (
              <Card
                key={interaction.id}
                className={`border-l-4 transition-all duration-200 hover:shadow-md ${config.borderColor} ${config.bgColor}/30`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="ring-background h-12 w-12 shadow-sm ring-2">
                        <AvatarImage
                          src={interaction.toUser.profileImageUrl ?? ""}
                          alt={interaction.toUser.displayName}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
                          {interaction.toUser.displayName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Interaction Icon Overlay */}
                      <div
                        className={`absolute -right-1 -bottom-1 rounded-full p-1.5 ${config.bgColor} border-background border-2 shadow-sm`}
                      >
                        <Icon className={`h-3 w-3 ${config.color}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="text-foreground truncate font-semibold">
                          {interaction.toUser.displayName}
                        </h3>
                        <span className="text-muted-foreground text-sm">
                          @{interaction.toUser.username}
                        </span>
                      </div>

                      <p className="text-muted-foreground mb-2 text-sm">
                        {config.description}
                      </p>

                      <div className="text-muted-foreground flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(
                            new Date(interaction.createdAt),
                            { addSuffix: true },
                          )}
                        </div>
                        {/* {interaction.context && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {interaction.context}
                          </div>
                        )} */}
                      </div>
                    </div>

                    {/* Action Badge */}
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={`${config.color} ${config.borderColor} ${config.bgColor}/50`}
                      >
                        {config.label}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `/u/${interaction.toUser.username}`,
                            "_blank",
                          )
                        }
                        className="text-xs opacity-70 hover:opacity-100"
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Results Summary */}
      {filteredHistory.length > 0 && (
        <div className="text-muted-foreground text-center text-sm">
          Showing {filteredHistory.length} of {initialHistory.length}{" "}
          interactions
        </div>
      )}
    </div>
  );
}
