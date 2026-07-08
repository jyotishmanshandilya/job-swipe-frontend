"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import PreferencesForm from "@/components/PreferencesForm";
import { Alert, Button, Input, Label, Spinner, Toggle } from "@/components/ui";
import { apiFetch, ApiRequestError } from "@/lib/api";
import type { Preferences, Profile } from "@/lib/types";

function ProfileSection() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    linkedinUrl: "",
    githubUrl: "",
  });
  const [status, setStatus] = useState<{ kind: "error" | "success"; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch<Profile>("/api/profile").then((p) => {
      setProfile(p);
      setForm({
        firstName: p.firstName ?? "",
        lastName: p.lastName ?? "",
        phoneNumber: p.phoneNumber ?? "",
        linkedinUrl: p.linkedinUrl ?? "",
        githubUrl: p.githubUrl ?? "",
      });
    });
  }, []);

  if (!profile) return <Spinner />;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    try {
      // Only send non-empty values — the API applies partial updates.
      const body = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== ""),
      );
      const updated = await apiFetch<Profile>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setProfile(updated);
      setStatus({ kind: "success", msg: "Profile saved." });
    } catch (err) {
      setStatus({
        kind: "error",
        msg: err instanceof ApiRequestError ? err.message : "Failed to save",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {status && <Alert kind={status.kind}>{status.msg}</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Username</Label>
          <Input value={profile.username} disabled />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={profile.email} disabled />
        </div>
        <div>
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" value={form.firstName} onChange={set("firstName")} />
        </div>
        <div>
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" value={form.lastName} onChange={set("lastName")} />
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+91…" />
      </div>
      <div>
        <Label htmlFor="linkedin">LinkedIn URL</Label>
        <Input id="linkedin" value={form.linkedinUrl} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/in/…" />
      </div>
      <div>
        <Label htmlFor="github">GitHub URL</Label>
        <Input id="github" value={form.githubUrl} onChange={set("githubUrl")} placeholder="https://github.com/…" />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

function PreferencesSection() {
  const [prefs, setPrefs] = useState<Preferences | null | undefined>(undefined);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<Preferences>("/api/preferences")
      .then(setPrefs)
      .catch(() => setPrefs(null)); // 404 = not set yet
  }, []);

  if (prefs === undefined) return <Spinner />;

  return (
    <div className="space-y-4">
      {saved && <Alert kind="success">Preferences saved.</Alert>}
      <PreferencesForm
        initial={prefs}
        submitLabel="Save preferences"
        onSaved={(p) => {
          setPrefs(p);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }}
      />
    </div>
  );
}

function DigestSection() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Preferences>("/api/preferences")
      .then((p) => setEnabled(p.emailNotificationsEnabled))
      .catch(() => setEnabled(null));
  }, []);

  if (enabled === null)
    return (
      <p className="text-sm font-semibold text-stone-500">
        Set your job preferences first to manage the daily digest.
      </p>
    );

  const toggle = async (value: boolean) => {
    setEnabled(value); // optimistic
    setError(null);
    try {
      await apiFetch<Preferences>(`/api/preferences/notifications?enabled=${value}`, {
        method: "PUT",
      });
    } catch (err) {
      setEnabled(!value);
      setError(err instanceof ApiRequestError ? err.message : "Failed to update");
    }
  };

  return (
    <div className="space-y-3">
      {error && <Alert kind="error">{error}</Alert>}
      <Toggle
        label="Daily job digest email"
        description="Every morning at 8 AM, get new jobs matching your preferences. Only sent when there's something new."
        checked={enabled}
        onChange={toggle}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border-2 border-stone-200 border-b-4 bg-white p-6">
      <h2 className="mb-4 text-lg font-extrabold text-stone-800">{title}</h2>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
        <h1 className="text-2xl font-extrabold text-stone-800">Settings</h1>
        <Section title="Profile">
          <ProfileSection />
        </Section>
        <Section title="Job preferences">
          <PreferencesSection />
        </Section>
        <Section title="Email notifications">
          <DigestSection />
        </Section>
      </div>
    </RequireAuth>
  );
}
