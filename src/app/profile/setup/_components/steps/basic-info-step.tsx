"use client";

import { useState } from "react";
import type { ProfileSetupData } from "../profile-setup-wizard";

interface BasicInfoStepProps {
  formData: ProfileSetupData;
  updateFormData: (updates: Partial<ProfileSetupData>) => void;
  userId: string;
}

export function BasicInfoStep({
  formData,
  updateFormData,
}: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required";
    } else if (formData.bio.length < 10) {
      newErrors.bio = "Bio must be at least 10 characters";
    }

    if (formData.age !== null && (formData.age < 13 || formData.age > 120)) {
      newErrors.age = "Age must be between 13 and 120";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Validation passed, parent component will handle navigation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          value={formData.displayName}
          onChange={(e) => updateFormData({ displayName: e.target.value })}
          className={`border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none ${
            errors.displayName ? "border-red-500" : ""
          }`}
          placeholder="Enter your display name"
        />
        {errors.displayName && (
          <p className="mt-1 text-sm text-red-500">{errors.displayName}</p>
        )}
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
          value={formData.bio}
          onChange={(e) => updateFormData({ bio: e.target.value })}
          rows={4}
          className={`border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none ${
            errors.bio ? "border-red-500" : ""
          }`}
          placeholder="Tell us about yourself, your musical background, and what you're looking for..."
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
        )}
        <p className="text-muted-foreground mt-1 text-sm">
          {formData.bio.length}/500 characters
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
          value={formData.age ?? ""}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : null;
            updateFormData({ age: value });
          }}
          min="13"
          max="120"
          className={`border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none ${
            errors.age ? "border-red-500" : ""
          }`}
          placeholder="Enter your age"
        />
        {errors.age && (
          <p className="mt-1 text-sm text-red-500">{errors.age}</p>
        )}
      </div>

      {/* Show Age Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="showAge"
          checked={formData.showAge}
          onChange={(e) => updateFormData({ showAge: e.target.checked })}
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
    </form>
  );
}
