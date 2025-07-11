import Link from "next/link";
import {
  Heart,
  MessageCircle,
  MapPin,
  Clock,
  Music,
  Music4Icon,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Match } from "@/server/matching/queries";

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function getMatchFactorColor(factor: string, score: number) {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "outline";
}

export default function MatchCard({ match }: { match: Match }) {
  const { user1, user2, matchScore, matchFactors, createdAt } = match;

  // Get location display
  const getLocationDisplay = (user: typeof user1) => {
    if (user.city && user.region) {
      return `${user.city}, ${user.region}`;
    } else if (user.city) {
      return user.city;
    } else if (user.region) {
      return user.region;
    }
    return user.country ?? "Unknown";
  };

  return (
    <Card className="group hover:border-primary/20 w-1/4 border-2 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        {/* Header with match score */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music4Icon className="text-primary h-5 w-5" />
            <span className="text-muted-foreground text-sm font-medium">
              {Math.round(matchScore)}% Match
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(createdAt)}
          </div>
        </div>

        {/* Users section */}
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* User 1 */}
          <div className="flex items-center gap-3">
            <Avatar className="border-primary/10 h-12 w-12 border-2">
              <AvatarImage
                src={user1.profileImageUrl ?? ""}
                alt={user1.displayName}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user1.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold">
                {user1.displayName}
              </h3>
              <p className="text-muted-foreground truncate text-xs">
                @{user1.username}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <MapPin className="text-muted-foreground h-3 w-3" />
                <span className="text-muted-foreground truncate text-xs">
                  {getLocationDisplay(user1)}
                </span>
              </div>
            </div>
          </div>

          {/* User 2 */}
          <div className="flex items-center gap-3">
            <Avatar className="border-primary/10 h-12 w-12 border-2">
              <AvatarImage
                src={user2.profileImageUrl ?? ""}
                alt={user2.displayName}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user2.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold">
                {user2.displayName}
              </h3>
              <p className="text-muted-foreground truncate text-xs">
                @{user2.username}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <MapPin className="text-muted-foreground h-3 w-3" />
                <span className="text-muted-foreground truncate text-xs">
                  {getLocationDisplay(user2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Match factors */}
        {matchFactors && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <Music className="text-primary h-4 w-4" />
              <span className="text-sm font-medium">Match Factors</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(matchFactors).map(([factor, score]) => {
                const factorScore = typeof score === "number" ? score : 0;
                return (
                  <Badge
                    key={factor}
                    variant={getMatchFactorColor(factor, factorScore)}
                    className="text-xs"
                  >
                    {factor.replace(/([A-Z])/g, " $1").trim()}{" "}
                    {Math.round(factorScore)}%
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress bar for match score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Match</span>
            <span className="text-primary text-sm font-bold">
              {Math.round(matchScore)}%
            </span>
          </div>
          <div className="bg-secondary h-2 w-full rounded-full">
            <div
              className="from-primary/60 to-primary h-2 rounded-full bg-gradient-to-r transition-all duration-500"
              style={{ width: `${Math.min(matchScore, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 p-6 pt-0 sm:flex-row">
        <Button asChild className="flex-1" size="sm">
          <Link href={`/matches/${match.id}`}>View Match</Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <MessageCircle className="h-4 w-4" />
          Message
        </Button>
      </CardFooter>
    </Card>
  );
}
