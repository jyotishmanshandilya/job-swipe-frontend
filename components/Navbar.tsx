"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import OwlMascot from "./OwlMascot";
import { Button, Modal } from "./ui";
import { Squiggle } from "./Doodles";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const active = usePathname() === href;
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
}

export default function Navbar() {
  const { authenticated, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

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
              <NavLink href="/saved">My jobs</NavLink>
              <NavLink href="/settings">Settings</NavLink>
              <button
                onClick={() => setConfirmLogout(true)}
                className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              >
                Log out
              </button>
              <Modal
                open={confirmLogout}
                onClose={() => setConfirmLogout(false)}
                title="Log out?"
              >
                <p className="text-sm font-semibold text-stone-500">
                  The owl keeps hunting either way — your matches will be here
                  when you get back.
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setConfirmLogout(false)}
                  >
                    Stay logged in
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setConfirmLogout(false);
                      logout();
                    }}
                  >
                    Log out
                  </Button>
                </div>
              </Modal>
            </>
          ) : (
            <>
              <NavLink href="/login">Log in</NavLink>
              <Link
                href="/register"
                className="ml-2 rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-4 py-1.5 text-sm font-extrabold text-amber-950 shadow-hard-sm transition-all hover:bg-amber-300 active:translate-y-[2px] active:border-b-2 active:shadow-hard-xs"
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
