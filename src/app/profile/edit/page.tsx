import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUserProfile,
  getInstruments,
  getGenres,
} from "@/server/queries";
import { updateProfile } from "./_actions/update-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  User,
  Guitar,
  Music,
  MapPin,
  AlertCircle,
} from "lucide-react";

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Professional" },
] as const;

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const error = params.error
    ? (JSON.parse(decodeURIComponent(params.error)) as Record<string, string>)
    : null;

  const [user, instruments, genres] = await Promise.all([
    getCurrentUserProfile(userId),
    getInstruments(),
    getGenres(),
  ]);

  if (!user) {
    redirect("/profile/setup");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">
              Update your profile information and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">
                Please fix the following errors:
              </span>
            </div>
            <ul className="mt-2 ml-6 list-disc text-sm text-red-600 dark:text-red-400">
              {Object.values(error).map(
                (errorMessage: string, index: number) => (
                  <li key={index}>{errorMessage}</li>
                ),
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      <form action={updateProfile} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="displayName"
                  className="text-foreground mb-2 block text-sm font-medium"
                >
                  Display Name *
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  defaultValue={user.displayName}
                  className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                  placeholder="Enter your display name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="text-foreground mb-2 block text-sm font-medium"
                >
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  defaultValue={user.age?.toString() ?? ""}
                  min="13"
                  max="120"
                  className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                  placeholder="Enter your age"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="bio"
                className="text-foreground mb-2 block text-sm font-medium"
              >
                Bio *
              </label>
              <textarea
                id="bio"
                name="bio"
                defaultValue={user.bio ?? ""}
                rows={4}
                className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                placeholder="Tell us about yourself, your musical background, and what you're looking for..."
                required
              />
              <p className="text-muted-foreground mt-1 text-sm">
                Minimum 10 characters
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showAge"
                name="showAge"
                value="true"
                defaultChecked={user.showAge ?? false}
                className="border-border text-primary focus:ring-primary h-4 w-4 rounded border focus:ring-2"
              />
              <label htmlFor="showAge" className="text-foreground text-sm">
                Show my age on my profile
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor="city"
                  className="text-foreground mb-2 block text-sm font-medium"
                >
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  defaultValue={user.city ?? ""}
                  className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                  placeholder="e.g., New York"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="region"
                  className="text-foreground mb-2 block text-sm font-medium"
                >
                  State/Province *
                </label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  defaultValue={user.region ?? ""}
                  className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                  placeholder="e.g., New York"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="text-foreground mb-2 block text-sm font-medium"
                >
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  defaultValue={user.country ?? ""}
                  className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                  placeholder="e.g., United States"
                  required
                />
              </div>
            </div>
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
            <div className="space-y-4">
              {/* Dynamic Instruments - We'll need to make this interactive */}
              <div className="bg-muted border-border rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-foreground font-medium">Instrument 1</h4>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="instruments[0][isPrimary]"
                        value="true"
                        defaultChecked={user.instruments[0]?.isPrimary ?? true}
                        className="border-border text-primary focus:ring-primary h-4 w-4 rounded border focus:ring-2"
                      />
                      Primary
                    </label>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Instrument *
                    </label>
                    <select
                      name="instruments[0][instrumentId]"
                      defaultValue={user.instruments[0]?.id ?? ""}
                      className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                      required
                    >
                      <option value="">Select an instrument</option>
                      {instruments.map((instrument) => (
                        <option key={instrument.id} value={instrument.id}>
                          {instrument.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Skill Level
                    </label>
                    <select
                      name="instruments[0][skillLevel]"
                      defaultValue={
                        user.instruments[0]?.skillLevel ?? "intermediate"
                      }
                      className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                    >
                      {SKILL_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="instruments[0][yearsOfExperience]"
                      defaultValue={
                        user.instruments[0]?.yearsOfExperience?.toString() ?? ""
                      }
                      min="0"
                      max="50"
                      className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>
              </div>

              {/* Add more instruments button */}
              <button
                type="button"
                className="border-border text-foreground hover:bg-muted w-full rounded-lg border-2 border-dashed p-4 text-center transition-colors"
              >
                + Add Another Instrument
              </button>
            </div>
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
            <div className="space-y-4">
              {/* Dynamic Genres - We'll need to make this interactive */}
              <div className="bg-muted border-border rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-foreground font-medium">Genre 1</h4>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="genres[0][isPrimary]"
                        value="true"
                        defaultChecked={user.genres[0]?.preference === 5}
                        className="border-border text-primary focus:ring-primary h-4 w-4 rounded border focus:ring-2"
                      />
                      Primary
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Genre *
                  </label>
                  <select
                    name="genres[0][genreId]"
                    defaultValue={user.genres[0]?.id ?? ""}
                    className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                    required
                  >
                    <option value="">Select a genre</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add more genres button */}
              <button
                type="button"
                className="border-border text-foreground hover:bg-muted w-full rounded-lg border-2 border-dashed p-4 text-center transition-colors"
              >
                + Add Another Genre
              </button>
            </div>
          </CardContent>
        </Card>

        {/* TODO: Select Media */}

        {/* Submit Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/profile">Cancel</Link>
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
