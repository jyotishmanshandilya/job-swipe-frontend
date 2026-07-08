"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiRequestError } from "@/lib/api";
import { Alert, AuthShell, Button, Input, Label } from "@/components/ui";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setBusy(true);
    try {
      await register(form);
      // Straight into onboarding — preferences drive everything.
      router.push("/onboarding");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors ?? {});
      } else {
        setError("Something went wrong");
      }
    } finally {
      setBusy(false);
    }
  };

  const fieldError = (name: string) =>
    fieldErrors[name] && (
      <p className="mt-1 text-xs font-bold text-rose-600">{fieldErrors[name]}</p>
    );

  return (
    <AuthShell
      title="Join the nest"
      subtitle="Set your preferences once — wake up to matching jobs every day."
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}

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
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={form.username} onChange={set("username")} required />
          {fieldError("username")}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={set("email")} required />
          {fieldError("email")}
          <p className="mt-1 text-xs font-semibold text-stone-400">
            We&apos;ll send a verification link — daily digests only go to verified emails.
          </p>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
            required
            minLength={8}
          />
          {fieldError("password")}
        </div>

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Creating account…" : "Sign up free"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm font-semibold text-stone-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-amber-700 hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
