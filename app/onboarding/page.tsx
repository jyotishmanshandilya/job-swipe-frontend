"use client";

import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import PreferencesForm from "@/components/PreferencesForm";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <RequireAuth>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900">
          What are you looking for?
        </h1>
        <p className="mt-1 mb-8 text-sm text-gray-500">
          We&apos;ll use this to match jobs to you — in the app and in your
          daily email digest. You can change it anytime in Settings.
        </p>
        <PreferencesForm
          submitLabel="Save and see my matches"
          onSaved={() => router.push("/jobs")}
        />
      </div>
    </RequireAuth>
  );
}
