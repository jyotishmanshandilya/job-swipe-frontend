"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiRequestError } from "@/lib/api";
import { Alert, AuthShell, Button, Input, Label } from "@/components/ui";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const expired = useSearchParams().get("expired") === "1";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(username, password);
      router.push("/jobs");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Something went wrong",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="The owl kept watch. Log in to see what it found.">
      <form onSubmit={submit} className="space-y-4">
        {expired && (
          <Alert kind="info">Your session expired — please log in again.</Alert>
        )}
        {error && <Alert kind="error">{error}</Alert>}

        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
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

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="mt-4 flex justify-between text-sm font-bold">
        <Link href="/forgot-password" className="text-amber-700 hover:underline">
          Forgot password?
        </Link>
        <Link href="/register" className="text-amber-700 hover:underline">
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
