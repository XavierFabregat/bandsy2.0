"use client";

import type { ProfileSetupData } from "../profile-setup-wizard";

interface LocationStepProps {
  formData: ProfileSetupData;
  updateFormData: (updates: Partial<ProfileSetupData>) => void;
  userId: string;
}

export function LocationStep({ formData, updateFormData }: LocationStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-medium">
          Where are you located?
        </h3>
        <p className="text-muted-foreground text-sm">
          This helps us find musicians near you
        </p>
      </div>

      <div className="space-y-4">
        {/* City */}
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
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
            placeholder="e.g., San Francisco"
          />
        </div>

        {/* Region/State */}
        <div>
          <label
            htmlFor="region"
            className="text-foreground mb-2 block text-sm font-medium"
          >
            Region/State *
          </label>
          <input
            type="text"
            id="region"
            value={formData.region}
            onChange={(e) => updateFormData({ region: e.target.value })}
            className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
            placeholder="e.g., California"
          />
        </div>

        {/* Country */}
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
            value={formData.country}
            onChange={(e) => updateFormData({ country: e.target.value })}
            className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
            placeholder="e.g., United States"
          />
        </div>
      </div>

      <div className="bg-muted border-border rounded-lg border p-4">
        <h3 className="text-foreground mb-2 font-medium">Privacy Note:</h3>
        <p className="text-muted-foreground text-sm">
          Your exact location is never shared. We only use this information to
          help you find musicians in your area. You can always update your
          location later.
        </p>
      </div>
    </div>
  );
}
