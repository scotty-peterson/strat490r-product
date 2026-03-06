"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next") || "/saved";

    // Supabase automatically picks up the token from the URL hash.
    // We just need to wait for onAuthStateChange to fire.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          subscription.unsubscribe();
          router.replace(next);
        }
      }
    );

    // Also check if already signed in (e.g., link clicked in same browser)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        router.replace(next);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg-primary gap-4">
      <div className="text-4xl animate-pulse">✨</div>
      <p className="text-text-muted text-base">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center bg-bg-primary">
          <p className="text-text-muted">Loading…</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
