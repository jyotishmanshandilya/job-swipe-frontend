"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Spinner } from "./ui";

/**
 * Client-side route guard: the JWT lives in localStorage, so protection
 * happens after hydration rather than in middleware.
 */
export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authenticated === false) router.replace("/login");
  }, [authenticated, router]);

  if (authenticated !== true) return <Spinner />;
  return <>{children}</>;
}
