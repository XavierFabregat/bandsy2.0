import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getMatchDetails } from "@/server/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MapPin,
  Calendar,
  Music,
  Guitar,
  MessageCircle,
  Star,
  TrendingUp,
  Users,
  User,
} from "lucide-react";
import Link from "next/link";
import type { MatchDetails, UserProfile } from "@/types/api";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

function CompatibilityScore({
  score,
  factors,
}: {
  score: number | null;
  factors: MatchDetails["matchFactors"];
}) {
  if (!score || !factors) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Compatibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Compatibility analysis unavailable
          </p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Challenging Match";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Compatibility Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {Math.round(score)}%
          </div>
          <p className="text-muted-foreground text-sm">
            {getScoreDescription(score)}
          </p>
        </div>

        <div className="space-y-3">
          {factors.location !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">Location</span>
              </div>
              <Badge variant="secondary">{Math.round(factors.location)}%</Badge>
            </div>
          )}

          {factors.genres !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">Musical Taste</span>
              </div>
              <Badge variant="secondary">{Math.round(factors.genres)}%</Badge>
            </div>
          )}

          {factors.instruments !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Guitar className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">Instruments</span>
              </div>
              <Badge variant="secondary">
                {Math.round(factors.instruments)}%
              </Badge>
            </div>
          )}

          {factors.experience !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">Skill Level</span>
              </div>
              <Badge variant="secondary">
                {Math.round(factors.experience)}%
              </Badge>
            </div>
          )}

          {factors.activity !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">Activity</span>
              </div>
              <Badge variant="secondary">{Math.round(factors.activity)}%</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UserCard({
  user,
  isCurrentUser,
}: {
  user: UserProfile;
  isCurrentUser: boolean;
}) {
  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "professional":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <Card className={isCurrentUser ? "ring-primary ring-2" : ""}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
          {user.profileImageUrl ? (
            <Avatar className="h-full w-full">
              <AvatarImage
                src={user.profileImageUrl}
                className="h-full w-full object-cover"
              />
              <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center rounded-full">
              <User className="text-muted-foreground h-12 w-12" />
            </div>
          )}
        </div>
        <CardTitle className="text-xl">{user.displayName}</CardTitle>
        <p className="text-muted-foreground">@{user.username}</p>
        {isCurrentUser && (
          <Badge variant="secondary" className="self-center">
            You
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        {user.bio && (
          <div>
            <p className="text-muted-foreground text-sm">{user.bio}</p>
          </div>
        )}

        {/* Location */}
        {user.city && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="text-muted-foreground h-4 w-4" />
            <span>
              {user.city}
              {user.region && `, ${user.region}`}
              {user.country && `, ${user.country}`}
            </span>
          </div>
        )}

        {/* Age */}
        {user.age && user.showAge && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span>{user.age} years old</span>
          </div>
        )}

        {/* Instruments */}
        {user.instruments.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Guitar className="h-4 w-4" />
              Instruments
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.instruments.map((instrument) => (
                <Badge
                  key={instrument.id}
                  variant="outline"
                  className={instrument.isPrimary ? "border-primary" : ""}
                >
                  {instrument.name}
                  <span
                    className={`ml-1 rounded px-1 text-xs ${getSkillLevelColor(instrument.skillLevel)}`}
                  >
                    {instrument.skillLevel}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Genres */}
        {user.genres.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Music className="h-4 w-4" />
              Musical Genres
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.genres.map((genre) => (
                <Badge key={genre.id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Member Since */}
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>Member since {formatDate(user.createdAt)}</span>
        </div>

        {/* Profile Link */}
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/u/${user.username}`}>View Full Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ChatSection({
  matchId,
  conversation,
}: {
  matchId: string;
  conversation: MatchDetails["conversation"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Conversation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {conversation ? (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              {conversation.hasMessages
                ? "Continue your conversation"
                : "Start chatting with your match!"}
            </p>
            <Button className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              {conversation.hasMessages ? "Open Chat" : "Send First Message"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Chat will be available once the conversation is set up.
            </p>
            <Button disabled className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Setting up chat...
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const matchDetails = await getMatchDetails(id, userId);

  if (!matchDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <Heart className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-2 text-xl font-semibold">Match Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This match doesn&apos;t exist or you don&apos;t have permission to
              view it.
            </p>
            <Button asChild>
              <Link href="/discover">Back to Discovery</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 fill-current text-red-500" />
          <h1 className="text-3xl font-bold">It&apos;s a Match!</h1>
          <Heart className="h-8 w-8 fill-current text-red-500" />
        </div>
        <p className="text-muted-foreground">
          You matched on {formatDate(matchDetails.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Current User */}
        <div className="space-y-6">
          <UserCard user={matchDetails.currentUser} isCurrentUser={true} />
        </div>

        {/* Center: Compatibility & Chat */}
        <div className="space-y-6">
          <CompatibilityScore
            score={matchDetails.matchScore}
            factors={matchDetails.matchFactors}
          />
          <ChatSection
            matchId={matchDetails.id}
            conversation={matchDetails.conversation!}
          />
        </div>

        {/* Right: Other User */}
        <div className="space-y-6">
          <UserCard user={matchDetails.otherUser} isCurrentUser={false} />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/discover">Continue Discovering</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/matches">View All Matches</Link>
        </Button>
      </div>
    </div>
  );
}
