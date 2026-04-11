"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SurpriseButton from "@/components/SurpriseButton";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import CitySelector from "@/components/CitySelector";
import ThemeToggle from "@/components/ThemeToggle";
import WeatherWidget from "@/components/WeatherWidget";
import { useSeasonalContent } from "@/components/SeasonalTagline";
import { useAllDateHistory } from "@/hooks/useDateHistory";
import { useAuth } from "@/lib/auth-context";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";
import { getCurrentSeason, getTimeOfDay } from "@/lib/constants";
import { COLLECTIONS, getCollectionIdeas } from "@/data/collections";

function getImageUrl(ideaId: string): string {
  const hash = ideaId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${hash}/400/250`;
}

export default function Home() {
  const { subtitle, cta } = useSeasonalContent();
  const { user } = useAuth();
  const { entries, completedIdeaIds } = useAllDateHistory();
  const router = useRouter();

  // Quick picks: 3 ideas that match the current time/season, exclude completed
  const quickPicks = useMemo(() => {
    const season = getCurrentSeason();
    const tod = getTimeOfDay();
    const isLate = tod === "late-night";
    const all = dateIdeas as DateIdea[];

    return all
      .filter((idea) => {
        if (completedIdeaIds.has(idea.id)) return false;
        // Must be in season if seasonal
        if (idea.seasonalAvailability && idea.seasonalAvailability.length > 0) {
          if (!idea.seasonalAvailability.includes(season)) return false;
        }
        // Late night filter
        if (isLate && !idea.lateNightFriendly) return false;
        return true;
      })
      .sort(() => {
        // Deterministic daily shuffle using day of year
        const dayOfYear = Math.floor(
          (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
        );
        return Math.sin(dayOfYear * 127.1) - 0.5;
      })
      .slice(0, 3);
  }, [completedIdeaIds]);

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      <WelcomeOverlay />

      {/* Top nav bar */}
      <div className="relative z-20 flex items-center justify-between px-4 md:px-8 pt-4 pb-2">
        <CitySelector />
        <div className="flex items-center gap-2">
          <ThemeToggle />
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
          <p className="text-sm text-text-muted mb-4 max-w-xs mx-auto">
            {subtitle}
          </p>
          <div className="mb-6 flex justify-center">
            <WeatherWidget />
          </div>

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
            <div className="flex items-center gap-3">
              <SurpriseButton />
              <Link
                href="/swipe"
                className="mt-4 inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-accent-secondary bg-accent-secondary/10 border border-accent-secondary/25 rounded-2xl transition-all duration-200 hover:bg-accent-secondary/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Swipe
              </Link>
              <Link
                href="/wheel"
                className="mt-4 inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-rose-600 bg-rose-500/10 border border-rose-500/25 rounded-2xl transition-all duration-200 hover:bg-rose-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992" />
                </svg>
                Spin
              </Link>
            </div>
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
        </div>
      </div>

      {/* Tonight's Quick Picks — below the fold */}
      {quickPicks.length > 0 && (
        <div className="relative z-10 px-6 pb-8 md:max-w-4xl md:mx-auto md:w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Tonight&apos;s picks</h2>
              <p className="text-xs text-text-muted">Fresh ideas picked for right now</p>
            </div>
            <Link
              href="/explore"
              className="text-xs font-semibold text-accent-primary hover:underline"
            >
              See all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickPicks.map((idea) => (
              <div
                key={idea.id}
                onClick={() => router.push(`/idea/${idea.id}`)}
                className="bg-bg-card rounded-2xl border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:border-border-hover hover:shadow-sm active:scale-[0.98]"
              >
                <div className="relative h-32 sm:h-28 overflow-hidden">
                  <img
                    src={getImageUrl(idea.id)}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {idea.estimatedCostDollars === 0 && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-accent-primary shadow-sm">
                      FREE
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-1 mb-0.5">
                    {idea.title}
                  </h3>
                  <p className="text-[11px] text-text-muted line-clamp-1">
                    {idea.estimatedCostDollars === 0
                      ? "Free"
                      : `$${idea.estimatedCostDollars}`}
                    {" "}&middot;{" "}
                    {idea.estimatedTimeMinutes < 60
                      ? `${idea.estimatedTimeMinutes}m`
                      : `${Math.floor(idea.estimatedTimeMinutes / 60)}h`}
                    {idea.specificLocation && (
                      <>
                        {" "}&middot;{" "}
                        <span className="text-accent-primary">{idea.specificLocation}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collections */}
      <div className="relative z-10 px-6 pb-8 md:max-w-4xl md:mx-auto md:w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">Collections</h2>
          <Link
            href="/this-or-that"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-secondary bg-accent-secondary/10 border border-accent-secondary/20 rounded-full px-3 py-1.5 hover:bg-accent-secondary/20 transition-colors"
          >
            <span>🎯</span> This or That
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {COLLECTIONS.map((col) => {
            const count = getCollectionIdeas(col, dateIdeas as DateIdea[], getCurrentSeason()).length;
            return (
              <Link
                key={col.id}
                href={`/explore?collection=${col.id}`}
                className="group relative overflow-hidden rounded-xl h-24 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${col.gradient}`} />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                <div className="relative h-full flex flex-col justify-end p-3">
                  <p className="text-white font-bold text-sm leading-tight">{col.title}</p>
                  <p className="text-white/60 text-[10px] mt-0.5">{count} ideas</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="relative z-10 px-6 pb-6 md:max-w-4xl md:mx-auto md:w-full">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/achievements"
            className="group flex items-center gap-3 p-4 bg-bg-card border border-border rounded-2xl hover:border-amber-400/50 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg">
              🏆
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Achievements</p>
              <p className="text-[11px] text-text-muted">Unlock badges</p>
            </div>
          </Link>
          <Link
            href="/wrapped"
            className="group flex items-center gap-3 p-4 bg-bg-card border border-border rounded-2xl hover:border-violet-400/50 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-lg">
              ✨
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Date Wrapped</p>
              <p className="text-[11px] text-text-muted">Your date story</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Explore CTA + Partner link */}
      <div className="relative z-10 text-center pb-10 px-6">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary bg-bg-card border border-border rounded-full px-5 py-2.5 hover:border-border-hover hover:text-accent-primary transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Browse all {(dateIdeas as DateIdea[]).length} ideas
        </Link>
        <div className="mt-3">
          <Link
            href="/partner"
            className="text-xs text-text-muted hover:text-accent-primary transition-colors"
          >
            Local business? Partner with us
          </Link>
        </div>
      </div>
    </div>
  );
}
