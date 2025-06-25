"use client";

import { useState, useEffect } from "react";
import type { ProfileSetupData } from "../profile-setup-wizard";

interface InstrumentsStepProps {
  formData: ProfileSetupData;
  updateFormData: (updates: Partial<ProfileSetupData>) => void;
  userId: string;
}

interface Instrument {
  id: string;
  name: string;
  category: string;
}

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Professional" },
] as const;

export function InstrumentsStep({
  formData,
  updateFormData,
}: InstrumentsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await fetch("/api/instruments");
        if (response.ok) {
          const data = (await response.json()) as Instrument[];
          setInstruments(data);
        }
      } catch (error) {
        console.error("Error fetching instruments:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchInstruments();
  }, []);

  const addInstrument = () => {
    const newInstrument = {
      instrumentId: "",
      skillLevel: "intermediate" as const,
      yearsOfExperience: null,
      isPrimary: formData.instruments.length === 0, // First instrument is primary by default
    };

    updateFormData({
      instruments: [...formData.instruments, newInstrument],
    });
  };

  const removeInstrument = (index: number) => {
    const newInstruments = formData.instruments.filter((_, i) => i !== index);

    // If we removed the primary instrument, make the first one primary
    if (formData.instruments[index]?.isPrimary && newInstruments.length > 0) {
      newInstruments[0]!.isPrimary = true;
    }

    updateFormData({ instruments: newInstruments });
  };

  const updateInstrument = (
    index: number,
    updates: Partial<(typeof formData.instruments)[0]>,
  ) => {
    const newInstruments = [...formData.instruments];
    newInstruments[index] = {
      ...newInstruments[index]!,
      ...updates,
    };

    // If setting this as primary, unset others
    if (updates.isPrimary) {
      newInstruments.forEach((instrument, i) => {
        if (i !== index) instrument.isPrimary = false;
      });
    }

    updateFormData({ instruments: newInstruments });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.instruments.length === 0) {
      newErrors.instruments = "Please add at least one instrument";
    }

    formData.instruments.forEach((instrument, index) => {
      if (!instrument.instrumentId) {
        newErrors[`instrument-${index}`] = "Please select an instrument";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <span className="text-muted-foreground ml-2">
          Loading instruments...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-medium">
          What instruments do you play?
        </h3>
        <p className="text-muted-foreground text-sm">
          Add all the instruments you play, and mark your primary one
        </p>
      </div>

      {/* Instruments List */}
      <div className="space-y-4">
        {formData.instruments.map((instrument, index) => (
          <div
            key={index}
            className="bg-muted border-border rounded-lg border p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-foreground font-medium">
                Instrument {index + 1}
              </h4>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={instrument.isPrimary}
                    onChange={(e) =>
                      updateInstrument(index, { isPrimary: e.target.checked })
                    }
                    className="border-border text-primary focus:ring-primary h-4 w-4 rounded border focus:ring-2"
                  />
                  Primary
                </label>
                {formData.instruments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstrument(index)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Instrument Selection */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Instrument *
                </label>
                <select
                  value={instrument.instrumentId}
                  onChange={(e) =>
                    updateInstrument(index, { instrumentId: e.target.value })
                  }
                  className={`border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none ${
                    errors[`instrument-${index}`] ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select an instrument</option>
                  {instruments.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
                {errors[`instrument-${index}`] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors[`instrument-${index}`]}
                  </p>
                )}
              </div>

              {/* Skill Level */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Skill Level
                </label>
                <select
                  value={instrument.skillLevel}
                  onChange={(e) =>
                    updateInstrument(index, {
                      skillLevel: e.target.value as
                        | "beginner"
                        | "intermediate"
                        | "advanced"
                        | "professional",
                    })
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

              {/* Years of Experience */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={instrument.yearsOfExperience ?? ""}
                  onChange={(e) => {
                    const value = e.target.value
                      ? parseInt(e.target.value)
                      : null;
                    updateInstrument(index, { yearsOfExperience: value });
                  }}
                  min="0"
                  max="50"
                  className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                  placeholder="e.g., 5"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Instrument Button */}
      <button
        type="button"
        onClick={addInstrument}
        className="border-border text-foreground hover:bg-muted w-full rounded-lg border-2 border-dashed p-4 text-center transition-colors"
      >
        + Add Another Instrument
      </button>

      {errors.instruments && (
        <p className="text-sm text-red-500">{errors.instruments}</p>
      )}

      <div className="bg-muted border-border rounded-lg border p-4">
        <h3 className="text-foreground mb-2 font-medium">Tips:</h3>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>• Mark your main instrument as &quot;Primary&quot;</li>
          <li>• Be honest about your skill level - it helps with matching</li>
          <li>• You can always add more instruments later</li>
        </ul>
      </div>
    </div>
  );
}
