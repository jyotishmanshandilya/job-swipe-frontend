"use client";

import { useEffect, useRef } from "react";

const GSI_SRC = "https://accounts.google.com/gsi/client";

type CredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (res: CredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

// Load the GSI script exactly once, shared across mounts.
let scriptPromise: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't reach Google Sign-In"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Renders the official "Continue with Google" button. `onCredential` receives
 * the Google ID token (JWT) to POST to /api/auth/google. Keep `onCredential`
 * and `onError` stable (useCallback) — they're effect deps.
 */
export function GoogleSignInButton({
  onCredential,
  onError,
}: {
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      onError?.("Google Sign-In is not configured");
      return;
    }
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !ref.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => onCredential(res.credential),
        });
        window.google.accounts.id.renderButton(ref.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
          shape: "pill",
        });
      })
      .catch((e) =>
        onError?.(e instanceof Error ? e.message : "Google Sign-In failed"),
      );
    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential, onError]);

  return <div ref={ref} className="flex justify-center" />;
}
