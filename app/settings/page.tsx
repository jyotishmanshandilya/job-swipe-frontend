"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import PreferencesForm from "@/components/PreferencesForm";
import { REASONS } from "@/components/ReportJobButton";
import { Alert, Button, Input, Label, Modal, Spinner, Toggle } from "@/components/ui";
import {
  apiFetch,
  ApiRequestError,
  clearTokens,
  deleteAccount,
  getMyReports,
  unreportJob,
} from "@/lib/api";
import type { MyJobReport, Preferences, Profile } from "@/lib/types";

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
      <div>
        <Label>Email</Label>
        <Input value={profile.email} disabled />
      </div>
      <div className="grid grid-cols-2 gap-3">
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

/**
 * Collapsed by default — reported jobs are a corrective tool, not a daily
 * destination. Fetches lazily on first expand; "Restore" withdraws the report
 * so the job returns to the matched feed.
 */
function ReportedJobsSection() {
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState<MyJobReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && reports === null) {
      getMyReports()
        .then(setReports)
        .catch((err) =>
          setError(
            err instanceof ApiRequestError ? err.message : "Failed to load reports",
          ),
        );
    }
  };

  const restore = async (report: MyJobReport) => {
    setError(null);
    setRestoring(report.id);
    try {
      await unreportJob(report.companyJobsId);
      setReports((prev) => prev?.filter((r) => r.id !== report.id) ?? prev);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Failed to restore job",
      );
    } finally {
      setRestoring(null);
    }
  };

  const reasonLabel = (reason: MyJobReport["reason"]) =>
    REASONS.find((r) => r.value === reason)?.label ?? reason;

  return (
    <section className="shadow-hard rounded-2xl border-2 border-stone-800/90 bg-white">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-3 p-6 text-left"
      >
        <div>
          <h2 className="text-lg font-extrabold text-stone-800">Reported jobs</h2>
          <p className="mt-0.5 text-xs font-semibold text-stone-500">
            Jobs you&apos;ve flagged and hidden from your feed — restore any you
            reported by mistake.
          </p>
        </div>
        <span
          className={`shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="border-t-2 border-stone-100 p-6 pt-4">
          {error && (
            <div className="mb-3">
              <Alert kind="error">{error}</Alert>
            </div>
          )}
          {reports === null && !error ? (
            <Spinner />
          ) : !reports || reports.length === 0 ? (
            <p className="text-sm font-semibold text-stone-500">
              Nothing here — you haven&apos;t reported any jobs.
            </p>
          ) : (
            <ul className="space-y-3">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl border-2 border-stone-200 px-3.5 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-stone-800">
                      {r.jobTitle ?? "Job no longer listed"}
                      {r.companyName && (
                        <span className="font-semibold capitalize text-stone-500">
                          {" "}
                          · {r.companyName}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-stone-500">
                      {reasonLabel(r.reason)} ·{" "}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={restoring === r.id}
                    onClick={() => restore(r)}
                    className="shrink-0 !px-3 !py-1"
                  >
                    {restoring === r.id ? "Restoring…" : "Restore"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function DangerZoneSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setOpen(false);
    setPassword("");
    setError(null);
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await deleteAccount(password);
      // Account is gone — tokens are dead; leave immediately.
      clearTokens();
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? (err.fieldErrors?.password ?? err.message)
          : "Failed to delete account",
      );
      setBusy(false);
    }
  };

  return (
    <>
      <p className="text-sm font-semibold text-stone-500">
        Permanently delete your account, preferences, and job matches. This
        cannot be undone.
      </p>
      <Button
        type="button"
        variant="danger"
        className="mt-4"
        onClick={() => setOpen(true)}
      >
        Delete my account
      </Button>

      <Modal open={open} onClose={close} title="Delete your account?">
        <p className="text-sm font-semibold text-stone-500">
          The owl will forget you completely — profile, preferences, and
          matches are all deleted permanently. Enter your password to confirm.
        </p>
        <form onSubmit={confirm} className="mt-4 space-y-3">
          {error && <Alert kind="error">{error}</Alert>}
          <div>
            <Label htmlFor="delete-password">Password</Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={busy || !password}>
              {busy ? "Deleting…" : "Delete forever"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Section({
  title,
  tone = "default",
  children,
}: {
  title: string;
  tone?: "default" | "danger";
  children: React.ReactNode;
}) {
  const danger = tone === "danger";
  return (
    <section
      className={`shadow-hard rounded-2xl border-2 bg-white p-6 ${
        danger ? "border-rose-300" : "border-stone-800/90"
      }`}
    >
      <h2
        className={`mb-4 text-lg font-extrabold ${
          danger ? "text-rose-700" : "text-stone-800"
        }`}
      >
        {title}
      </h2>
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
        <ReportedJobsSection />
        <Section title="Danger zone" tone="danger">
          <DangerZoneSection />
        </Section>
      </div>
    </RequireAuth>
  );
}
