"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import OwlMascot from "./OwlMascot";
import { Squiggle } from "./Doodles";

export default function Navbar() {
  const { authenticated, logout } = useAuth();
  const pathname = usePathname();

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`relative px-3 py-1.5 text-sm font-bold transition-colors ${
          active
            ? "text-amber-900"
            : "rounded-full text-stone-600 hover:bg-stone-100 hover:text-stone-900"
        }`}
      >
        {children}
        {active && (
          <span className="pointer-events-none absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-amber-500">
            <Squiggle size={34} strokeWidth={3} />
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-10 border-b-2 border-stone-200/70 bg-[#FFF8ED]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <Link href="/" className="wiggle-hover flex items-center gap-2">
          <OwlMascot size={30} />
          <span className="font-display text-xl font-extrabold text-stone-800">
            Role<span className="text-amber-600">Owl</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {authenticated ? (
            <>
              <NavLink href="/jobs">Jobs</NavLink>
              <NavLink href="/settings">Settings</NavLink>
              <button
                onClick={logout}
                className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login">Log in</NavLink>
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
