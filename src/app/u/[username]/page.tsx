import { notFound } from "next/navigation";
import { getUserByUsername } from "@/server/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Music, Guitar, User, Clock } from "lucide-react";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{user.displayName}</h1>
        <p className="text-muted-foreground">@{user.username}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="bg-muted mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="text-muted-foreground h-12 w-12" />
                  </div>
                )}
              </div>
              <CardTitle className="text-xl">{user.displayName}</CardTitle>
              <p className="text-muted-foreground">@{user.username}</p>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {/* Member Since */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span>Member since {formatDate(user.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              {user.bio ? (
                <p className="text-muted-foreground leading-relaxed">
                  {user.bio}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No bio available.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Instruments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Guitar className="h-5 w-5" />
                Instruments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.instruments.length > 0 ? (
                <div className="space-y-3">
                  {user.instruments.map((instrument) => (
                    <div
                      key={instrument.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <h4 className="font-medium">{instrument.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {instrument.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getSkillLevelColor(instrument.skillLevel)}
                        >
                          {instrument.skillLevel}
                        </Badge>
                        {instrument.isPrimary && (
                          <Badge variant="secondary">Primary</Badge>
                        )}
                        {instrument.yearsOfExperience && (
                          <span className="text-muted-foreground text-sm">
                            {instrument.yearsOfExperience} years
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No instruments listed.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Genres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Genres
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.genres.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.genres
                    .sort((a, b) => b.preference - a.preference)
                    .map((genre) => (
                      <Badge
                        key={genre.id}
                        variant={
                          genre.preference === 5 ? "default" : "secondary"
                        }
                      >
                        {genre.name}
                        {genre.preference === 5 && (
                          <span className="ml-1 text-xs">(Primary)</span>
                        )}
                      </Badge>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No genres listed.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
