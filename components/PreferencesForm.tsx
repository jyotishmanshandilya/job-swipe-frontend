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

export default function PreferencesForm({
  initial,
  submitLabel,
  onSaved,
  onProgress,
}: {
  initial?: Preferences | null;
  submitLabel: string;
  onSaved: (saved: Preferences) => void;
  /** Fires as the form fills in — lets the page's owl wake up (see /onboarding). */
  onProgress?: (progress: { hasTitles: boolean }) => void;
}) {
  const [titles, setTitlesState] = useState<string[]>(
    initial?.preferredJobTitles ?? [],
  );
  const setTitles = (next: string[]) => {
    setTitlesState(next);
    onProgress?.({ hasTitles: next.length > 0 });
  };
  const [locations, setLocations] = useState<string[]>(
    initial?.preferredLocations ?? [],
  );
  const [remoteOk, setRemoteOk] = useState(initial?.remoteOk ?? false);
  const [relocate, setRelocate] = useState(
    initial?.willingToRelocate ?? false,
  );
  const [yoe, setYoe] = useState(initial?.yearsOfExperience ?? 0);
  const [stretch, setStretch] = useState(initial?.stretchYears ?? 0);
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
        // Employment type isn't collected anymore (jobs carry no such data);
        // preserve whatever was stored so older rows aren't clobbered.
        employmentType: initial?.employmentType ?? [],
        remoteOk,
        willingToRelocate: relocate,
        yearsOfExperience: yoe,
        stretchYears: stretch,
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

      <div>
        <Label>Also show roles asking for more experience</Label>
        <div className="flex overflow-hidden rounded-2xl border-2 border-stone-200">
          {[0, 1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStretch(n)}
              className={`flex-1 px-3 py-2 text-sm font-bold transition-colors ${
                stretch === n
                  ? "bg-amber-400 text-amber-950"
                  : "bg-white text-stone-500 hover:bg-stone-50"
              } ${n > 0 ? "border-l-2 border-stone-200" : ""}`}
            >
              {n === 0 ? "Strict" : `+${n} yrs`}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-stone-500">
          {stretch === 0
            ? "Only roles at or below your experience level"
            : `Includes roles asking up to ${stretch} year${stretch > 1 ? "s" : ""} more than you have`}
        </p>
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
          description="Show matching jobs from every location"
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
