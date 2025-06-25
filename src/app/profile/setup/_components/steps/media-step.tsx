"use client";

import type { ProfileSetupData } from "../profile-setup-wizard";

interface MediaStepProps {
  formData: ProfileSetupData;
  updateFormData: (updates: Partial<ProfileSetupData>) => void;
  userId: string;
}

export function MediaStep({ formData, updateFormData }: MediaStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-medium">
          Add some media to your profile
        </h3>
        <p className="text-muted-foreground text-sm">
          Upload a profile picture and audio/video samples (optional)
        </p>
      </div>

      {/* Profile Image */}
      <div className="space-y-4">
        <h4 className="text-foreground font-medium">Profile Picture</h4>
        <div className="border-border rounded-lg border-2 border-dashed p-8 text-center">
          <div className="mb-4 text-4xl">📷</div>
          <p className="text-muted-foreground mb-4">
            Upload a profile picture to make your profile stand out
          </p>
          <button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 font-medium transition-colors"
          >
            Upload Image
          </button>
        </div>
      </div>

      {/* Audio/Video Samples */}
      <div className="space-y-4">
        <h4 className="text-foreground font-medium">Audio/Video Samples</h4>
        <div className="border-border rounded-lg border-2 border-dashed p-8 text-center">
          <div className="mb-4 text-4xl">🎵</div>
          <p className="text-muted-foreground mb-4">
            Share your music with potential bandmates
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 font-medium transition-colors"
            >
              Upload Audio
            </button>
            <button
              type="button"
              className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2 font-medium transition-colors"
            >
              Upload Video
            </button>
          </div>
        </div>
      </div>

      <div className="bg-muted border-border rounded-lg border p-4">
        <h3 className="text-foreground mb-2 font-medium">
          Tips for great media:
        </h3>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>• Use a clear, professional profile picture</li>
          <li>• Upload your best performances</li>
          <li>• Keep audio/video samples under 3 minutes</li>
          <li>• You can always add more later</li>
        </ul>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-medium text-blue-800">Optional Step</h3>
        <p className="text-sm text-blue-700">
          You can skip this step and add media later. Your profile will still be
          complete without media uploads.
        </p>
      </div>
    </div>
  );
}
