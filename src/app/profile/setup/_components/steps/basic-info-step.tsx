import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/server/queries";
import { updateBasicInfo } from "../../_actions/basic-info";

export default async function BasicInfoStep() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get current user data to pre-populate the form
  const user = await getUserByClerkId(userId);

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-medium">
          Tell us about yourself
        </h3>
        <p className="text-muted-foreground text-sm">
          Let&apos;s start with the basics
        </p>
      </div>

      <form action={updateBasicInfo} className="space-y-6">
        {/* Display Name */}
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

        {/* Bio */}
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

        {/* Age */}
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

        {/* Show Age Toggle */}
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

        <div className="bg-muted border-border rounded-lg border p-4">
          <h3 className="text-foreground mb-2 font-medium">
            Tips for a great profile:
          </h3>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• Be specific about your musical interests and goals</li>
            <li>
              • Mention your experience level and what you&apos;re looking for
            </li>
            <li>
              • Include any bands you&apos;ve been in or projects you&apos;ve
              worked on
            </li>
            <li>• Be honest about your availability and commitment level</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 font-medium transition-colors"
          >
            Next: Instruments
          </button>
        </div>
      </form>
    </div>
  );
}
