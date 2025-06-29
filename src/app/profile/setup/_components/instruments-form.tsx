"use client";

import { useState } from "react";
import { updateInstruments } from "../_actions/instruments";

interface Instrument {
  id: string;
  name: string;
  category: string | null;
}

interface UserInstrument {
  instrumentId: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "professional";
  yearsOfExperience: number | null;
  isPrimary: boolean | null;
}

interface InstrumentsFormProps {
  instruments: Instrument[];
  userInstruments: UserInstrument[];
}

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Professional" },
] as const;

export function InstrumentsForm({
  instruments,
  userInstruments,
}: InstrumentsFormProps) {
  const [formInstruments, setFormInstruments] = useState<UserInstrument[]>(
    userInstruments.length > 0
      ? userInstruments
      : [
          {
            instrumentId: "",
            skillLevel: "intermediate",
            yearsOfExperience: null,
            isPrimary: true,
          },
        ],
  );

  const addInstrument = () => {
    const newInstrument = {
      instrumentId: "",
      skillLevel: "intermediate" as const,
      yearsOfExperience: null,
      isPrimary: formInstruments.length === 0,
    };

    setFormInstruments((prev) => [...prev, newInstrument]);
  };

  const removeInstrument = (index: number) => {
    const newInstruments = formInstruments.filter((_, i) => i !== index);

    // If we removed the primary instrument, make the first one primary
    if (formInstruments[index]?.isPrimary && newInstruments.length > 0) {
      newInstruments[0]!.isPrimary = true;
    }

    setFormInstruments(newInstruments);
  };

  const updateInstrument = (
    index: number,
    updates: Partial<UserInstrument>,
  ) => {
    const newInstruments = [...formInstruments];
    newInstruments[index] = { ...newInstruments[index]!, ...updates };

    // If setting this as primary, unset others
    if (updates.isPrimary) {
      newInstruments.forEach((instrument, i) => {
        if (i !== index) instrument.isPrimary = false;
      });
    }

    setFormInstruments(newInstruments);
  };

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

      <form action={updateInstruments}>
        {/* Instruments List */}
        <div className="space-y-4">
          {formInstruments.map((instrument, index) => (
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
                      checked={instrument.isPrimary ?? false}
                      onChange={(e) =>
                        updateInstrument(index, { isPrimary: e.target.checked })
                      }
                      className="border-border text-primary focus:ring-primary h-4 w-4 rounded border focus:ring-2"
                    />
                    Primary
                  </label>
                  {formInstruments.length > 1 && (
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
                    name={`instruments[${index}][instrumentId]`}
                    value={instrument.instrumentId}
                    onChange={(e) =>
                      updateInstrument(index, { instrumentId: e.target.value })
                    }
                    className="border-border text-foreground bg-background focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                    required
                  >
                    <option value="">Select an instrument</option>
                    {instruments.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skill Level */}
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Skill Level
                  </label>
                  <select
                    name={`instruments[${index}][skillLevel]`}
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
                    name={`instruments[${index}][yearsOfExperience]`}
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

                {/* Hidden field for isPrimary */}
                <input
                  type="hidden"
                  name={`instruments[${index}][isPrimary]`}
                  value={(instrument.isPrimary ?? false).toString()}
                />
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

        <div className="bg-muted border-border rounded-lg border p-4">
          <h3 className="text-foreground mb-2 font-medium">Tips:</h3>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• Mark your main instrument as &quot;Primary&quot;</li>
            <li>• Be honest about your skill level - it helps with matching</li>
            <li>• You can always add more instruments later</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between">
          <a
            href="/profile/setup/basic-info"
            className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2 font-medium transition-colors"
          >
            Previous
          </a>

          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 font-medium transition-colors"
          >
            Next: Genres
          </button>
        </div>
      </form>
    </div>
  );
}
