import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserProfile } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Music,
  Guitar,
  Edit,
  Eye,
  Clock,
  User,
  Activity,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PencilUTButton from "../_components/pencilUTButton";

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  console.log("userId", userId);

  const user = await getCurrentUserProfile(userId);
  console.log("user", user);

  if (!user) {
    console.log("No user found");
    redirect("/profile/setup");
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
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      case "professional":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/profile/edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/u/${user.username}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Public Profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="text-center">
              <div className="bg-muted relative mx-auto mb-4 h-24 w-24 overflow-visible rounded-full">
                {user.profileImageUrl ? (
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user.profileImageUrl} />
                    <AvatarFallback>
                      {user.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full">
                    <User className="text-muted-foreground h-12 w-12" />
                  </div>
                )}
                <div className="absolute -right-1 -bottom-1 z-20">
                  <PencilUTButton />
                </div>
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

              {/* Last Updated */}
              <div className="flex items-center gap-2 text-sm">
                <Edit className="text-muted-foreground h-4 w-4" />
                <span>Updated {formatDate(user.updatedAt!)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Activity className="text-muted-foreground h-4 w-4" />
                <span>Recent Activity</span> (To Be Implemented)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              {user.bio ? (
                <p className="text-muted-foreground leading-relaxed">
                  {user.bio}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No bio added yet.
                  <Link
                    href="/profile/edit"
                    className="text-primary ml-1 hover:underline"
                  >
                    Add one now
                  </Link>
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
                  No instruments added yet.
                  <Link
                    href="/profile/edit"
                    className="text-primary ml-1 hover:underline"
                  >
                    Add your instruments
                  </Link>
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
                  No genres added yet.
                  <Link
                    href="/profile/edit"
                    className="text-primary ml-1 hover:underline"
                  >
                    Add your genres
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Profile Status</span>
                  <span className="font-medium">Complete</span>
                </div>
                <div className="bg-muted h-2 rounded-full">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: "100%" }}
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Your profile is complete and visible to other musicians!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
