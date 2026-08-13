"use client";

import { Suspense, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiRequestError } from "@/lib/api";
import { Alert, AuthShell, Button, Input, Label } from "@/components/ds";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const expired = useSearchParams().get("expired") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.push("/jobs");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Something went wrong",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = useCallback(
    async (idToken: string) => {
      setError(null);
      setBusy(true);
      try {
        await loginWithGoogle(idToken);
        router.push("/jobs");
      } catch (err) {
        setError(
          err instanceof ApiRequestError ? err.message : "Google sign-in failed",
        );
      } finally {
        setBusy(false);
      }
    },
    [loginWithGoogle, router],
  );

  return (
    <AuthShell title="Welcome back" subtitle="The owl kept watch. Log in to see what it found.">
      <form onSubmit={submit} className="space-y-4">
        {expired && (
          <Alert kind="info">
            The owl dozed off and your session expired — log back in to pick up
            the hunt.
          </Alert>
        )}
        {error && <Alert kind="error">{error}</Alert>}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <Button type="submit" disabled={busy} fullWidth>
          {busy ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div style={{ margin: "20px 0", display: "flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 700, color: "var(--text-faint)" }}>
        <span style={{ height: 1, flex: 1, background: "var(--stone-200)" }} />
        or
        <span style={{ height: 1, flex: 1, background: "var(--stone-200)" }} />
      </div>

      <GoogleSignInButton onCredential={handleGoogle} onError={setError} />

      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
        <Link href="/forgot-password" style={{ color: "var(--amber-600)" }}>
          Forgot password?
        </Link>
        <Link href="/register" style={{ color: "var(--amber-600)" }}>
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
