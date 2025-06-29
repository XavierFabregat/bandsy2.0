"use client";

import { useState } from "react";
import { updateMedia } from "../_actions/media";

export function MediaForm() {
  const [isUploading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-medium">
          Add some media samples (Optional)
        </h3>
        <p className="text-muted-foreground text-sm">
          Upload audio or video samples to showcase your skills
        </p>
      </div>

      <form action={updateMedia}>
        <div className="space-y-6">
          {/* Media Upload Section */}
          <div className="bg-muted border-border rounded-lg border p-6">
            <h4 className="text-foreground mb-4 font-medium">
              Upload Media Samples
            </h4>

            <div className="space-y-4">
              {/* Audio Upload */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Audio Sample
                </label>
                <div className="border-border text-muted-foreground bg-background flex items-center justify-center rounded-lg border-2 border-dashed p-8">
                  <div className="text-center">
                    <svg
                      className="text-muted-foreground mx-auto h-12 w-12"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm">Click to upload audio file</p>
                    <p className="text-xs">MP3, WAV up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Video Sample
                </label>
                <div className="border-border text-muted-foreground bg-background flex items-center justify-center rounded-lg border-2 border-dashed p-8">
                  <div className="text-center">
                    <svg
                      className="text-muted-foreground mx-auto h-12 w-12"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm">Click to upload video file</p>
                    <p className="text-xs">MP4, MOV up to 50MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-muted-foreground text-sm">
                Media uploads coming soon! You can skip this step for now.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-muted border-border rounded-lg border p-4">
            <h3 className="text-foreground mb-2 font-medium">
              Tips for great media samples:
            </h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Keep samples under 2 minutes for best engagement</li>
              <li>• Showcase your best playing and unique style</li>
              <li>• Include different genres to show versatility</li>
              <li>• Make sure audio quality is clear</li>
              <li>• You can always add more samples later</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between">
            <a
              href="/profile/setup/location"
              className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2 font-medium transition-colors"
            >
              Previous
            </a>

            <button
              type="submit"
              disabled={isUploading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 font-medium transition-colors disabled:opacity-50"
            >
              {isUploading ? "Completing..." : "Complete Profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
