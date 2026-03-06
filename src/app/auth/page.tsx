"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/saved";

  // Already signed in — redirect
  if (user) {
    router.replace(next);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <Link
          href={next.startsWith("/idea") ? next : "/"}
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          {submitted ? (
            <div className="text-center">
              <div className="text-5xl mb-6">📬</div>
              <h1 className="text-2xl font-bold text-text-primary mb-3">
                Check your email
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                We sent a sign-in link to{" "}
                <span className="text-text-primary font-semibold">{email}</span>
                . Tap the link and you&apos;ll be signed in instantly.
              </p>
              <p className="text-text-muted text-xs mt-4">
                No password needed — ever.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🔖</div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                  Save your favorites
                </h1>
                <p className="text-text-secondary text-sm">
                  Sign in with your email — no password, no fuss.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  className="w-full px-4 py-4 rounded-2xl bg-bg-card border-2 border-border text-text-primary placeholder:text-text-muted text-base focus:outline-none focus:border-accent-primary transition-colors"
                />
                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-4 bg-accent-primary text-bg-primary font-bold rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? "Sending…" : "Send Magic Link"}
                </button>
              </form>

              <p className="text-xs text-text-muted text-center mt-6">
                We&apos;ll email you a one-time link. No password needed.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center bg-bg-primary">
          <div className="text-text-muted">Loading…</div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
