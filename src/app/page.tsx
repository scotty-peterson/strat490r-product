"use client";

import Link from "next/link";
import SurpriseButton from "@/components/SurpriseButton";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import CitySelector from "@/components/CitySelector";
import { useSeasonalContent } from "@/components/SeasonalTagline";
import { useAllDateHistory } from "@/hooks/useDateHistory";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { subtitle, cta } = useSeasonalContent();
  const { user } = useAuth();
  const { entries } = useAllDateHistory();

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      <WelcomeOverlay />

      {/* Top nav bar */}
      <div className="relative z-20 flex items-center justify-between px-4 md:px-8 pt-4 pb-2">
        <CitySelector />
        <div className="flex items-center gap-2">
          <Link
            href="/history"
            className="flex items-center gap-2 text-sm font-semibold text-accent-secondary bg-accent-secondary/15 border border-accent-secondary/30 rounded-full px-4 py-2 hover:bg-accent-secondary/25 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            History
          </Link>
          <Link
            href="/saved"
            className="flex items-center gap-2 text-sm font-semibold text-accent-primary bg-accent-primary/15 border border-accent-primary/30 rounded-full px-4 py-2 hover:bg-accent-primary/25 transition-colors"
          >
            <svg className="w-4 h-4 fill-accent-primary" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Saved
          </Link>
        </div>
      </div>

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/8 rounded-full blur-3xl" />

      {/* Main content — centered on mobile, tighter on desktop */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md md:max-w-lg text-center">
          {/* Brand */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-accent-primary mb-3 leading-tight">
            Rendition
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-1">
            Date nights, curated.
          </p>
          <p className="text-sm text-text-muted mb-6 max-w-xs mx-auto">
            {subtitle}
          </p>

          {/* Streak badge */}
          {user && entries.length > 0 && (() => {
            const now = new Date();
            const weekMs = 7 * 24 * 60 * 60 * 1000;
            let streak = 0;
            for (let i = 0; i < 52; i++) {
              const weekStart = new Date(now.getTime() - (i + 1) * weekMs);
              const weekEnd = new Date(now.getTime() - i * weekMs);
              const hasDate = entries.some((e) => {
                const d = new Date(e.completed_at);
                return d >= weekStart && d < weekEnd;
              });
              if (hasDate) streak++;
              else if (i > 0) break;
            }
            if (streak === 0) return null;
            return (
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
                <span className="text-base">&#x1F525;</span>
                {streak} week streak
                <span className="text-xs text-amber-500 font-normal">
                  · {entries.length} date{entries.length !== 1 ? "s" : ""} total
                </span>
              </div>
            );
          })()}

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/concierge"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-accent-primary rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              {cta}
              <svg
                className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <SurpriseButton />
          </div>

          {/* How it works — horizontal on desktop */}
          <div className="mt-12 md:mt-14 grid grid-cols-3 gap-6 text-center max-w-sm mx-auto">
            <div>
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-accent-primary/15 text-accent-primary text-sm font-bold flex items-center justify-center">1</div>
              <p className="text-xs text-text-muted">Pick your vibe</p>
            </div>
            <div>
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-accent-primary/15 text-accent-primary text-sm font-bold flex items-center justify-center">2</div>
              <p className="text-xs text-text-muted">Get 3 ideas</p>
            </div>
            <div>
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-accent-primary/15 text-accent-primary text-sm font-bold flex items-center justify-center">3</div>
              <p className="text-xs text-text-muted">Go have fun</p>
            </div>
          </div>

          {/* Partner link */}
          <div className="mt-8">
            <Link
              href="/partner"
              className="text-xs text-text-muted hover:text-accent-primary transition-colors"
            >
              Local business? Partner with us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
