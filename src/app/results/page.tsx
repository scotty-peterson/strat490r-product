"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ConciergeFilters, TimeRange, BudgetTier, Mood, Setting } from "@/lib/types";
import { matchIdeas } from "@/lib/matching";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";
import IdeaCard from "@/components/results/IdeaCard";

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
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
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
        <h1 className="text-sm font-semibold text-text-secondary">
          Your Night
        </h1>
        <div className="w-10" />
      </div>

      {/* Subheader */}
      <div className="px-6 pt-4 pb-2">
        <h2 className="text-2xl font-bold text-text-primary">
          {ideas.length > 0
            ? "Here are 3 ideas for tonight"
            : "We're running low on matches"}
        </h2>
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
      <div className="flex-1 px-6 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={refreshKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 mt-4"
          >
            {displayIdeas.map((idea, i) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <IdeaCard idea={idea} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-8">
          {ideas.length > 0 && (
            <button
              onClick={handleRefresh}
              className="w-full py-4 bg-bg-card border-2 border-border text-text-primary font-bold rounded-2xl text-base transition-all duration-200 hover:border-accent-primary hover:bg-bg-card-hover active:scale-[0.98]"
            >
              Show Me 3 More
            </button>
          )}
          <Link
            href="/saved"
            className="w-full py-4 bg-bg-card border-2 border-border text-text-primary font-bold rounded-2xl text-base transition-all duration-200 hover:border-accent-primary active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 fill-accent-primary" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Saved Ideas
          </Link>
          <button
            onClick={handleStartOver}
            className="w-full py-3 text-text-muted text-sm font-medium transition-colors hover:text-text-secondary"
          >
            Start Over
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
