"use client";

import { useState } from "react";
import { apiFetch, ApiRequestError } from "@/lib/api";
import type { Preferences, PreferencesRequest } from "@/lib/types";
import { Alert, Button, Input, Label, TagInput, Toggle } from "./ui";

const TITLE_SUGGESTIONS = [
  "software engineer",
  "backend engineer",
  "frontend engineer",
  "fullstack engineer",
];

const LOCATION_SUGGESTIONS = [
  "Bengaluru",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Delhi",
  "Noida",
  "Gurgaon",
  "Remote India",
];

const EMPLOYMENT_TYPES = ["full time", "contract", "internship"];

export default function PreferencesForm({
  initial,
  submitLabel,
  onSaved,
}: {
  initial?: Preferences | null;
  submitLabel: string;
  onSaved: (saved: Preferences) => void;
}) {
  const [titles, setTitles] = useState<string[]>(
    initial?.preferredJobTitles ?? [],
  );
  const [locations, setLocations] = useState<string[]>(
    initial?.preferredLocations ?? [],
  );
  const [employment, setEmployment] = useState<string[]>(
    initial?.employmentType ?? ["full time"],
  );
  const [remoteOk, setRemoteOk] = useState(initial?.remoteOk ?? false);
  const [relocate, setRelocate] = useState(
    initial?.willingToRelocate ?? false,
  );
  const [yoe, setYoe] = useState(initial?.yearsOfExperience ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (titles.length === 0) {
      setError("Add at least one job title you're looking for.");
      return;
    }
    setSaving(true);
    try {
      const body: PreferencesRequest = {
        preferredJobTitles: titles,
        preferredLocations: locations,
        employmentType: employment,
        remoteOk,
        willingToRelocate: relocate,
        yearsOfExperience: yoe,
      };
      const saved = await apiFetch<Preferences>("/api/preferences", {
        method: "POST",
        body: JSON.stringify(body),
      });
      onSaved(saved);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <Alert kind="error">{error}</Alert>}

      <TagInput
        label="Job titles you're looking for"
        values={titles}
        onChange={setTitles}
        placeholder="e.g. backend engineer — press Enter to add"
        suggestions={TITLE_SUGGESTIONS}
      />

      <TagInput
        label="Preferred locations"
        values={locations}
        onChange={setLocations}
        placeholder="e.g. Bengaluru — press Enter to add"
        suggestions={LOCATION_SUGGESTIONS}
      />

      <div>
        <Label>Employment type</Label>
        <div className="flex gap-4">
          {EMPLOYMENT_TYPES.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-stone-700"
            >
              <input
                type="checkbox"
                checked={employment.includes(t)}
                onChange={(e) =>
                  setEmployment(
                    e.target.checked
                      ? [...employment, t]
                      : employment.filter((x) => x !== t),
                  )
                }
                className="h-4 w-4 cursor-pointer rounded accent-amber-500"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="yoe">Years of experience</Label>
        <Input
          id="yoe"
          type="number"
          min={0}
          max={50}
          value={yoe}
          onChange={(e) => setYoe(Number(e.target.value))}
          className="max-w-[120px]"
        />
      </div>

      <div className="space-y-4">
        <Toggle
          label="Open to remote work"
          description="Remote jobs will match regardless of their listed location"
          checked={remoteOk}
          onChange={setRemoteOk}
        />
        <Toggle
          label="Willing to relocate"
          checked={relocate}
          onChange={setRelocate}
        />
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
