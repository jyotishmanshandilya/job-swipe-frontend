"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import OwlMascot from "./OwlMascot";
import { Button, Modal } from "./ds";
import { Squiggle } from "./Doodles";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      className="relative px-3 py-1.5 text-sm font-bold"
      style={{ color: active ? "var(--amber-950)" : "var(--stone-600)" }}
    >
      {children}
      {active && (
        <span className="pointer-events-none absolute -bottom-0.5 left-1/2 -translate-x-1/2" style={{ color: "var(--amber-500)" }}>
          <Squiggle size={34} strokeWidth={3} />
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const { authenticated, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const pathname = usePathname();

  // The landing page ("/") ships its own floating design-system nav — suppress
  // the global one there so they don't stack.
  if (pathname === "/") return null;

  return (
    <nav
      className="rds sticky top-0 z-10 backdrop-blur"
      style={{ borderBottom: "1px solid var(--stone-200)", background: "rgb(255 248 237 / 0.9)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <Link href="/" className="wiggle-hover flex items-center gap-2">
          <OwlMascot size={30} />
          <span className="text-xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Role<span style={{ color: "var(--amber-600)" }}>Owl</span>
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
                className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-bold"
                style={{ color: "var(--stone-600)" }}
              >
                Log out
              </button>
              <Modal
                open={confirmLogout}
                onClose={() => setConfirmLogout(false)}
                title="Log out?"
              >
                <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
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
                className="ml-2 text-sm font-extrabold"
                style={{ borderRadius: "var(--radius-2xl)", background: "var(--brand-primary)", color: "var(--brand-primary-text)", padding: "7px 16px", boxShadow: "var(--shadow-soft-sm)" }}
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
