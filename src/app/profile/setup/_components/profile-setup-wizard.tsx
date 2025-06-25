"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BasicInfoStep } from "./steps/basic-info-step";
import { InstrumentsStep } from "./steps/instruments-step";
import { GenresStep } from "./steps/genres-step";
import { LocationStep } from "./steps/location-step";
import { MediaStep } from "./steps/media-step";
import { ProgressBar } from "./progress-bar";

export interface ProfileSetupData {
  // Basic Info
  displayName: string;
  bio: string;
  age: number | null;
  showAge: boolean;

  // Instruments
  instruments: Array<{
    instrumentId: string;
    skillLevel: "beginner" | "intermediate" | "advanced" | "professional";
    yearsOfExperience: number | null;
    isPrimary: boolean;
  }>;

  // Genres
  genres: Array<{
    genreId: string;
    preference: number; // 1-5 scale
  }>;

  // Location
  city: string;
  region: string;
  country: string;
  latitude: string | null;
  longitude: string | null;

  // Media
  profileImageUrl: string | null;
  mediaSamples: Array<{
    title: string;
    description: string;
    fileUrl: string;
    fileType: "audio" | "video";
    instrumentId?: string;
  }>;
}

const STEPS = [
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  { id: "basic", title: "Basic Info", component: BasicInfoStep },
  { id: "instruments", title: "Instruments", component: InstrumentsStep },
  { id: "genres", title: "Genres", component: GenresStep },
  { id: "location", title: "Location", component: LocationStep },
  { id: "media", title: "Media", component: MediaStep },
];

interface ProfileSetupWizardProps {
  userId: string;
  completionPercentage: number;
}

export function ProfileSetupWizard({
  userId,
  completionPercentage,
}: ProfileSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProfileSetupData>({
    displayName: "",
    bio: "",
    age: null,
    showAge: false,
    instruments: [],
    genres: [],
    city: "",
    region: "",
    country: "",
    latitude: null,
    longitude: null,
    profileImageUrl: null,
    mediaSamples: [],
  });

  const router = useRouter();

  const updateFormData = (updates: Partial<ProfileSetupData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save profile data
      const response = await fetch("/api/profile/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/");
      } else {
        throw new Error("Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      // Handle error (show toast, etc.)
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const CurrentStepComponent = STEPS[currentStep]!.component;
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="bg-card border-border rounded-lg border p-6">
      {/* Progress Bar */}
      <ProgressBar
        currentStep={currentStep}
        totalSteps={STEPS.length}
        completionPercentage={completionPercentage}
      />

      {/* Step Title */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold">{STEPS[currentStep]?.title}</h2>
        <p className="text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}
        </p>
      </div>

      {/* Step Content */}
      <div className="mb-6">
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
          userId={userId}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={isFirstStep}
          className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {isLastStep ? (
            <button
              onClick={handleComplete}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 font-medium transition-colors"
            >
              Complete Profile
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 font-medium transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
