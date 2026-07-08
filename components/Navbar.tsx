"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import OwlMascot from "./OwlMascot";

export default function Navbar() {
  const { authenticated, logout } = useAuth();
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `px-3 py-1.5 text-sm font-bold rounded-full transition-colors ${
      pathname === href
        ? "bg-amber-100 text-amber-900"
        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
    }`;

  return (
    <nav className="sticky top-0 z-10 border-b-2 border-stone-200/70 bg-[#FFF8ED]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2">
          <OwlMascot size={30} />
          <span className="text-lg font-extrabold text-stone-800">
            Role<span className="text-amber-600">Owl</span>
          </span>
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
                className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900"
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
                className="ml-2 rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-4 py-1.5 text-sm font-extrabold text-amber-950 transition-all hover:bg-amber-300 active:translate-y-[2px] active:border-b-2"
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
