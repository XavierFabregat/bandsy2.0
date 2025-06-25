"use client";

import { useState } from "react";
import { updateLocation } from "../_actions/location";

interface LocationFormProps {
  userLocation: {
    city: string | null;
    region: string | null;
    country: string | null;
    latitude: string | null;
    longitude: string | null;
  };
}

export function LocationForm({ userLocation }: LocationFormProps) {
  const [location, setLocation] = useState({
    city: userLocation.city ?? "",
    region: userLocation.region ?? "",
    country: userLocation.country ?? "",
    latitude: userLocation.latitude ?? "",
    longitude: userLocation.longitude ?? "",
  });

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-medium">
          Where are you located?
        </h3>
        <p className="text-muted-foreground text-sm">
          This helps match you with musicians in your area
        </p>
      </div>

      <form action={updateLocation}>
        <div className="space-y-4">
          {/* Manual Location Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={location.city}
                onChange={(e) =>
                  setLocation((prev) => ({ ...prev, city: e.target.value }))
                }
                className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                placeholder="e.g., New York"
                required
              />
            </div>

            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">
                State/Province *
              </label>
              <input
                type="text"
                name="region"
                value={location.region}
                onChange={(e) =>
                  setLocation((prev) => ({ ...prev, region: e.target.value }))
                }
                className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                placeholder="e.g., New York"
                required
              />
            </div>

            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={location.country}
                onChange={(e) =>
                  setLocation((prev) => ({ ...prev, country: e.target.value }))
                }
                className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                placeholder="e.g., United States"
                required
              />
            </div>
          </div>

          {/* Hidden coordinates - for now we'll use placeholder values */}
          <input type="hidden" name="latitude" value="40.7128" />
          <input type="hidden" name="longitude" value="-74.0060" />

          {/* Location Preview */}
          {location.city && location.region && location.country && (
            <div className="bg-muted border-border rounded-lg border p-4">
              <h4 className="text-foreground mb-2 font-medium">
                Location Preview:
              </h4>
              <p className="text-muted-foreground">
                {location.city}, {location.region}, {location.country}
              </p>
            </div>
          )}
        </div>

        <div className="bg-muted border-border mt-6 rounded-lg border p-4">
          <h3 className="text-foreground mb-2 font-medium">Tips:</h3>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• Your location helps match you with nearby musicians</li>
            <li>• You can always update your location later</li>
            <li>
              • We respect your privacy - exact location is only used for
              matching
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-between">
          <a
            href="/profile/setup/genres"
            className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2 font-medium transition-colors"
          >
            Previous
          </a>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Next: Media"}
          </button>
        </div>
      </form>
    </div>
  );
}
