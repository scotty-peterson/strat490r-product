"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ConciergeFilters, TimeRange, BudgetTier, Mood, Setting } from "@/lib/types";
import { matchIdeas, countMatchingIdeas } from "@/lib/matching";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";
import IdeaCard from "@/components/results/IdeaCard";
import { useAllDateHistory } from "@/hooks/useDateHistory";

interface WeatherState {
  tempF: number;
  isBad: boolean;
}

const WEATHER_CACHE_KEY = "provo-weather";
const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function ResultsContent() {
  const searchParams = useSearchParams();
  const [shownIds, setShownIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const { completedIdeaIds } = useAllDateHistory();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(WEATHER_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as WeatherState & { cachedAt: number };
        if (Date.now() - cached.cachedAt < WEATHER_CACHE_TTL_MS) {
          setWeather({ tempF: cached.tempF, isBad: cached.isBad });
          return;
        }
      }
    } catch {
      // ignore parse errors
    }

    fetch("https://wttr.in/Provo,UT?format=j1")
      .then((r) => r.json())
      .then((data) => {
        const condition = data?.current_condition?.[0];
        if (!condition) return;
        const tempF = parseInt(condition.temp_F, 10);
        const code = parseInt(condition.weatherCode, 10);
        const isBad = tempF <= 32 || code >= 300;
        const result: WeatherState = { tempF, isBad };
        setWeather(result);
        try {
          sessionStorage.setItem(
            WEATHER_CACHE_KEY,
            JSON.stringify({ ...result, cachedAt: Date.now() })
          );
        } catch {
          // ignore storage errors
        }
      })
      .catch(() => {
        // Graceful degradation — show all results as normal
      });
  }, []);

  const filters: ConciergeFilters = useMemo(
    () => ({
      timeRange: (searchParams.get("time") || "60") as TimeRange,
      budgetTier: (searchParams.get("budget") || "under10") as BudgetTier,
      moods: (searchParams.get("moods")?.split(",") || ["chill"]) as Mood[],
      setting: (searchParams.get("setting") || "no-preference") as
        | Setting
        | "no-preference",
    }),
    [searchParams]
  );

  const ideas = useMemo(() => {
    const results = matchIdeas(
      dateIdeas as DateIdea[],
      filters,
      shownIds,
      3
    );
    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, refreshKey]);

  const totalCount = useMemo(
    () => countMatchingIdeas(dateIdeas as DateIdea[], filters),
    [filters]
  );

  const displayIdeas = useMemo(() => {
    if (!weather?.isBad) return ideas;
    const indoor = ideas.filter((i) => i.setting !== "outdoor");
    const outdoor = ideas.filter((i) => i.setting === "outdoor");
    return [...indoor, ...outdoor];
  }, [ideas, weather]);

  const outdoorDeprioritized = useMemo(() => {
    if (!weather?.isBad) return false;
    return ideas.some((i) => i.setting === "outdoor");
  }, [ideas, weather]);

  const handleRefresh = useCallback(() => {
    setShownIds((prev) => [...prev, ...ideas.map((i) => i.id)]);
    setRefreshKey((k) => k + 1);
  }, [ideas]);

  const handleStartOver = useCallback(() => {
    setShownIds([]);
    setRefreshKey(0);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-4 pb-2 md:max-w-6xl md:mx-auto md:w-full">
        <Link
          href="/concierge"
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
        <p className="text-xs font-medium tracking-widest uppercase text-text-muted">
          Your Night
        </p>
        <div className="w-10" />
      </div>

      {/* Subheader */}
      <div className="px-6 pt-4 pb-1 md:max-w-6xl md:mx-auto md:w-full">
        <h2 className="text-[1.65rem] md:text-3xl font-extrabold tracking-tight text-text-primary leading-tight">
          {ideas.length > 0
            ? "Tonight looks good"
            : "We're running low on matches"}
        </h2>
        {ideas.length > 0 && totalCount > 3 && (
          <p className="text-[13px] text-text-muted mt-1.5 tracking-wide">
            Showing 3 of {totalCount} ideas that fit
          </p>
        )}
        {ideas.length === 0 && (
          <p className="text-sm text-text-muted mt-2">
            Try broadening your preferences or start over.
          </p>
        )}
        {outdoorDeprioritized && weather && (
          <p className="text-xs text-text-muted mt-2">
            Outdoor ideas moved to the bottom — it&apos;s {weather.tempF}&deg;F outside
          </p>
        )}
      </div>

      {/* Results */}
      <div className="flex flex-col px-6 pb-8 md:pb-12 md:max-w-6xl md:mx-auto md:w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={refreshKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-4"
          >
            {displayIdeas.map((idea, i) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <IdeaCard idea={idea} isCompleted={completedIdeaIds.has(idea.id)} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Primary action */}
        {ideas.length > 0 && (
          <motion.button
            onClick={handleRefresh}
            whileTap={{ scale: 0.97 }}
            className="mt-8 mx-auto px-8 py-3.5 bg-accent-primary text-white font-semibold rounded-full text-[15px] tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-accent-primary/20 active:shadow-none"
          >
            Show me 3 more
          </motion.button>
        )}

        {/* Secondary nav row */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <Link
            href="/saved"
            className="group flex items-center gap-1.5 text-[13px] font-semibold text-text-muted hover:text-accent-primary transition-colors"
          >
            <svg className="w-4 h-4 fill-accent-primary/60 group-hover:fill-accent-primary transition-colors" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Saved
          </Link>
          <span className="w-px h-4 bg-border" />
          <Link
            href="/history"
            className="group flex items-center gap-1.5 text-[13px] font-semibold text-text-muted hover:text-accent-secondary transition-colors"
          >
            <svg className="w-4 h-4 text-accent-secondary/60 group-hover:text-accent-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            History
          </Link>
          <span className="w-px h-4 bg-border" />
          <button
            onClick={handleStartOver}
            className="text-[13px] font-semibold text-text-muted hover:text-text-secondary transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center bg-bg-primary">
          <div className="text-text-muted">Loading...</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
