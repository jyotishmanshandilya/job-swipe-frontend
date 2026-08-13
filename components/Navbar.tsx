"use client";

import { useEffect, useState } from "react";
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

/** Wider tap target for the hamburger dropdown; underlines the active route. */
function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-xl px-3 py-2.5 text-sm font-extrabold"
      style={{
        color: active ? "var(--amber-950)" : "var(--stone-600)",
        background: active ? "var(--amber-100)" : "transparent",
      }}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { authenticated, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // The landing page ("/") ships its own floating design-system nav — suppress
  // the global one there so they don't stack.
  if (pathname === "/") return null;

  const logoutModal = (
    <Modal open={confirmLogout} onClose={() => setConfirmLogout(false)} title="Log out?">
      <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
        The owl keeps hunting either way — your matches will be here when you get
        back.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => setConfirmLogout(false)}>
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
  );

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

        {/* Desktop links — inline, unchanged from before. */}
        <div className="hidden items-center gap-1 md:flex">
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

        {/* Mobile hamburger — collapses the cluttered link row into a menu. */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl md:hidden"
          style={{ color: "var(--stone-700)", border: "1.5px solid var(--stone-200)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown panel. */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{ borderTop: "1px solid var(--stone-200)", background: "rgb(255 248 237 / 0.98)" }}
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3">
            {authenticated ? (
              <>
                <MobileNavLink href="/jobs" onClick={() => setMenuOpen(false)}>Jobs</MobileNavLink>
                <MobileNavLink href="/saved" onClick={() => setMenuOpen(false)}>My jobs</MobileNavLink>
                <MobileNavLink href="/settings" onClick={() => setMenuOpen(false)}>Settings</MobileNavLink>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmLogout(true);
                  }}
                  className="mt-1 cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm font-extrabold"
                  style={{ color: "var(--stone-600)" }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <MobileNavLink href="/login" onClick={() => setMenuOpen(false)}>Log in</MobileNavLink>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 text-center text-sm font-extrabold"
                  style={{ borderRadius: "var(--radius-2xl)", background: "var(--brand-primary)", color: "var(--brand-primary-text)", padding: "10px 16px", boxShadow: "var(--shadow-soft-sm)" }}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {logoutModal}
    </nav>
  );
}
