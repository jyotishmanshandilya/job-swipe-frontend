"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { authenticated, logout } = useAuth();
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `px-3 py-2 text-sm rounded-md ${
      pathname === href
        ? "text-white bg-gray-700"
        : "text-gray-300 hover:text-white hover:bg-gray-800"
    }`;

  return (
    <nav className="bg-gray-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-white">
          JobSwipe
        </Link>
        <div className="flex items-center gap-1">
          {authenticated ? (
            <>
              <Link href="/jobs" className={linkClass("/jobs")}>
                Jobs
              </Link>
              <Link href="/settings" className={linkClass("/settings")}>
                Settings
              </Link>
              <button
                onClick={logout}
                className="px-3 py-2 text-sm text-gray-300 rounded-md hover:text-white hover:bg-gray-800"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass("/login")}>
                Log in
              </Link>
              <Link
                href="/register"
                className="ml-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
