"use client";

import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import PreferencesForm from "@/components/PreferencesForm";
import OwlMascot from "@/components/OwlMascot";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <RequireAuth>
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rise flex items-center gap-4">
          <OwlMascot size={64} />
          <div>
            <h1 className="text-2xl font-extrabold text-stone-800">
              What should the owl hunt for?
            </h1>
            <p className="mt-1 text-sm font-semibold text-stone-500">
              This drives your matches and the daily 8 AM digest. Change it
              anytime in Settings.
            </p>
          </div>
        </div>
        <div
          className="rise mt-8 rounded-3xl border-2 border-stone-200 border-b-4 bg-white p-6"
          style={{ animationDelay: "80ms" }}
        >
          <PreferencesForm
            submitLabel="Save and see my matches"
            onSaved={() => router.push("/jobs")}
          />
        </div>
      </div>
    </RequireAuth>
  );
}
