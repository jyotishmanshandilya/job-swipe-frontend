"use client";

import { useState } from "react";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { FEATURE_SKILLS } from "@/lib/flags";
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

const SKILL_SUGGESTIONS = [
  "Java",
  "Spring Boot",
  "Python",
  "React",
  "TypeScript",
  "Node.js",
  "AWS",
  "Kubernetes",
  "SQL",
  "Kafka",
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
  // Seeded from the stored value so it round-trips untouched when the input is
  // hidden (flag off) — the backend upsert overwrites this column on every
  // save, so omitting it would null the user's skills.
  const [skills, setSkills] = useState<string[]>(
    initial?.preferredSkills ?? [],
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
        // Always sent (seeded from the stored value); the input is only shown
        // when FEATURE_SKILLS is on.
        preferredSkills: skills,
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

      {FEATURE_SKILLS && (
        <TagInput
          label="Skills"
          values={skills}
          onChange={setSkills}
          placeholder="e.g. Java, Kafka — press Enter to add"
          suggestions={SKILL_SUGGESTIONS}
        />
      )}

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
        <Label htmlFor="stretch">Experience matching strictness</Label>
        <p className="mb-2 text-xs font-semibold text-stone-400">
          How far above your own experience a role&apos;s requirement can be
          and still show up in your matches.
        </p>
        <input
          id="stretch"
          type="range"
          min={0}
          max={3}
          step={1}
          value={stretch}
          onChange={(e) => setStretch(Number(e.target.value))}
          className="w-full cursor-pointer accent-amber-500"
        />
        <div className="mt-1 flex justify-between">
          {[0, 1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStretch(n)}
              className={`cursor-pointer text-xs font-bold transition-colors ${
                stretch === n
                  ? "text-amber-700"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {n === 0 ? "Strict" : `+${n} yr${n > 1 ? "s" : ""}`}
            </button>
          ))}
        </div>
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          {stretch === 0
            ? `Strict: only roles asking for ${yoe} yrs of experience or less.`
            : `Flexible: roles asking for up to ${yoe + stretch} yrs (your ${yoe} + ${stretch}) will also match.`}
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
