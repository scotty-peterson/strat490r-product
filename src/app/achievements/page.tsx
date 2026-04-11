"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useAllDateHistory } from "@/hooks/useDateHistory";
import { useAllSavedIdeas } from "@/hooks/useSavedIdea";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";
import { achievements, UserStats } from "@/data/achievements";

const allIdeas = dateIdeas as DateIdea[];

function computeWeekStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  // Get the Monday-based week number for each date
  const getWeek = (d: Date): number => {
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - start.getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor(diff / oneWeek);
  };

  const weeks = [...new Set(dates.map((d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${getWeek(date)}`;
  }))].sort().reverse();

  let streak = 1;
  for (let i = 1; i < weeks.length; i++) {
    const [prevYear, prevWeek] = weeks[i - 1].split("-").map(Number);
    const [curYear, curWeek] = weeks[i].split("-").map(Number);

    const isConsecutive =
      (prevYear === curYear && prevWeek - curWeek === 1) ||
      (prevYear - curYear === 1 && prevWeek === 0 && curWeek >= 51);

    if (isConsecutive) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function computeStats(
  entries: { idea_id: string; rating: number | null; completed_at: string }[],
  savedCount: number
): UserStats {
  const ideaMap = new Map(allIdeas.map((i) => [i.id, i]));

  const uniqueCategories = new Set<string>();
  const uniqueLocations = new Set<string>();
  let fiveStarDates = 0;
  let totalSpent = 0;
  let hasFreeDates = 0;
  let hasSplurgeDates = 0;
  let outdoorDates = 0;
  let indoorDates = 0;
  let creativeDates = 0;
  let ratingSum = 0;
  let ratingCount = 0;

  for (const entry of entries) {
    const idea = ideaMap.get(entry.idea_id);
    if (!idea) continue;

    uniqueCategories.add(idea.category);
    if (idea.specificLocation) uniqueLocations.add(idea.specificLocation);

    if (entry.rating === 5) fiveStarDates++;
    if (entry.rating !== null) {
      ratingSum += entry.rating;
      ratingCount++;
    }

    totalSpent += idea.estimatedCostDollars;
    if (idea.budgetTier === "free") hasFreeDates++;
    if (idea.budgetTier === "splurge") hasSplurgeDates++;
    if (idea.setting === "outdoor") outdoorDates++;
    if (idea.setting === "indoor") indoorDates++;
    if (idea.category === "creative-diy") creativeDates++;
  }

  const weekStreak = computeWeekStreak(entries.map((e) => e.completed_at));

  return {
    totalDates: entries.length,
    totalSaved: savedCount,
    uniqueCategories,
    uniqueLocations,
    averageRating: ratingCount > 0 ? ratingSum / ratingCount : 0,
    hasFreeDates,
    hasSplurgeDates,
    weekStreak,
    fiveStarDates,
    totalSpent,
    outdoorDates,
    indoorDates,
    creativeDates,
  };
}

const tierColors = {
  bronze: {
    bg: "bg-amber-900/20",
    border: "border-amber-700/50",
    glow: "shadow-amber-600/20",
    badge: "bg-amber-700/30 text-amber-300",
    label: "Bronze",
  },
  silver: {
    bg: "bg-slate-500/15",
    border: "border-slate-400/50",
    glow: "shadow-slate-400/20",
    badge: "bg-slate-600/30 text-slate-300",
    label: "Silver",
  },
  gold: {
    bg: "bg-yellow-600/15",
    border: "border-yellow-500/50",
    glow: "shadow-yellow-500/25",
    badge: "bg-yellow-600/30 text-yellow-300",
    label: "Gold",
  },
};

function AchievementCard({
  achievement,
  unlocked,
  index,
}: {
  achievement: (typeof achievements)[0];
  unlocked: boolean;
  index: number;
}) {
  const tier = tierColors[achievement.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={`relative rounded-2xl border p-4 transition-all ${
        unlocked
          ? `${tier.bg} ${tier.border} shadow-lg ${tier.glow}`
          : "bg-bg-card/40 border-border opacity-60"
      }`}
    >
      {/* Tier badge */}
      <span
        className={`absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
          unlocked ? tier.badge : "bg-bg-secondary text-text-muted"
        }`}
      >
        {tier.label}
      </span>

      {/* Icon */}
      <div className="relative w-12 h-12 flex items-center justify-center text-3xl mb-3">
        {unlocked ? (
          achievement.icon
        ) : (
          <div className="relative">
            <span className="opacity-30 grayscale">{achievement.icon}</span>
            <span className="absolute inset-0 flex items-center justify-center text-lg">
              🔒
            </span>
          </div>
        )}
      </div>

      {/* Text */}
      <h3
        className={`font-semibold text-sm mb-1 ${
          unlocked ? "text-text-primary" : "text-text-muted"
        }`}
      >
        {achievement.title}
      </h3>
      <p
        className={`text-xs leading-relaxed mb-2 ${
          unlocked ? "text-text-secondary" : "text-text-muted"
        }`}
      >
        {achievement.description}
      </p>
      <p className="text-[11px] text-text-muted">{achievement.requirement}</p>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const { user, loading: authLoading } = useAuth();
  const { entries, loading: historyLoading } = useAllDateHistory();
  const { savedIds, loading: savedLoading } = useAllSavedIdeas();

  const loading = authLoading || historyLoading || savedLoading;

  const stats = useMemo(
    () => computeStats(entries, savedIds.length),
    [entries, savedIds]
  );

  const unlockedIds = useMemo(() => {
    const set = new Set<string>();
    for (const a of achievements) {
      if (a.check(stats)) set.add(a.id);
    }
    return set;
  }, [stats]);

  const unlockedCount = unlockedIds.size;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg-primary px-6 text-center">
        <span className="text-5xl mb-4">🏆</span>
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Achievements
        </h1>
        <p className="text-text-secondary mb-6 max-w-xs">
          Sign in to start earning badges and tracking your date night journey.
        </p>
        <Link
          href="/auth?next=/achievements"
          className="px-6 py-3 rounded-xl bg-accent-primary text-white font-semibold text-sm"
        >
          Sign In
        </Link>
        <Link href="/" className="mt-4 text-sm text-text-muted underline">
          Back to Home
        </Link>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-bg-primary pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-bg-secondary flex items-center justify-center text-text-secondary"
          >
            <svg
              className="w-5 h-5"
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
          <div className="flex-1">
            <h1 className="text-lg font-bold text-text-primary">
              Achievements
            </h1>
            <p className="text-xs text-text-muted">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
          <span className="text-2xl">🏆</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Achievement grid */}
      <div className="px-4 pt-6">
        {/* Tier sections */}
        {(["gold", "silver", "bronze"] as const).map((tier) => {
          const tierAchievements = achievements.filter((a) => a.tier === tier);
          const tierUnlocked = tierAchievements.filter((a) =>
            unlockedIds.has(a.id)
          ).length;

          return (
            <div key={tier} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">
                  {tier === "gold" ? "🥇" : tier === "silver" ? "🥈" : "🥉"}
                </span>
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  {tier}
                </h2>
                <span className="text-xs text-text-muted ml-auto">
                  {tierUnlocked}/{tierAchievements.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {tierAchievements.map((achievement, i) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={unlockedIds.has(achievement.id)}
                    index={i}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
