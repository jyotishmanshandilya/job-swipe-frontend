"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { Alert, AuthShell, Button, Input, Label } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiFetch<string>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Something went wrong",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {sent ? (
        <div className="space-y-4">
          <Alert kind="success">
            If an account exists for {email}, a reset link is on its way. The
            link is valid for 1 hour.
          </Alert>
          <Link
            href="/login"
            className="block text-center text-sm font-bold text-amber-700 hover:underline"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && <Alert kind="error">{error}</Alert>}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
