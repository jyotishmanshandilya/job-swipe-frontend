"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import PreferencesForm from "@/components/PreferencesForm";
import OwlMascot from "@/components/OwlMascot";

export default function OnboardingPage() {
  const router = useRouter();
  // The owl dozes until the form has at least one job title, then wakes up.
  const [awake, setAwake] = useState(false);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rise flex items-center gap-4">
          <OwlMascot
            size={64}
            variant={awake ? "happy" : "sleepy"}
            className={awake ? "" : "owl-snooze"}
          />
          <div>
            <h1 className="text-2xl font-extrabold text-stone-800">
              What should the owl hunt for?
            </h1>
            <p className="mt-1 text-sm font-semibold text-stone-500">
              {awake
                ? "The owl is awake and taking notes. Change any of this later in Settings."
                : "The owl is dozing until it knows what to hunt. Add a job title to wake it."}
            </p>
          </div>
        </div>
        <div
          className="rise shadow-hard mt-8 rounded-3xl border-2 border-stone-800/90 bg-white p-6"
          style={{ animationDelay: "80ms" }}
        >
          <PreferencesForm
            submitLabel="Save and see my matches"
            onSaved={() => router.push("/jobs")}
            onProgress={({ hasTitles }) => setAwake(hasTitles)}
          />
        </div>
      </div>
    </RequireAuth>
  );
}
