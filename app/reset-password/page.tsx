"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { Alert, AuthShell, Button, Input, Label } from "@/components/ui";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await apiFetch<string>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Something went wrong",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <Alert kind="error">
        This reset link is missing its token. Please use the link from your
        email, or{" "}
        <Link href="/forgot-password" className="underline">
          request a new one
        </Link>
        .
      </Alert>
    );
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <Alert kind="success">Your password has been updated.</Alert>
        <Link
          href="/login"
          className="inline-block rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-4 py-2 text-sm font-extrabold text-amber-950 transition-all hover:bg-amber-300 active:translate-y-[2px] active:border-b-2"
        >
          Log in with your new password
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Updating…" : "Set new password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="The reset link is valid for 1 hour and can be used once."
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
