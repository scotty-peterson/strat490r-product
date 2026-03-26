"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useAllDateHistory, DateHistoryEntry } from "@/hooks/useDateHistory";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";

const allIdeas = dateIdeas as DateIdea[];

function StarDisplay({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-border fill-none"
          }`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function HistoryCard({
  entry,
  idea,
  index,
}: {
  entry: DateHistoryEntry;
  idea: DateIdea | undefined;
  index: number;
}) {
  const router = useRouter();

  if (!idea) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/idea/${idea.id}`)}
      className="bg-bg-card rounded-2xl border-2 border-border p-5 cursor-pointer transition-all duration-200 hover:border-border-hover hover:bg-bg-card-hover active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-bold text-text-primary flex-1">
          {idea.title}
        </h3>
        <span className="text-xs text-text-muted whitespace-nowrap">
          {formatDate(entry.completed_at)}
        </span>
      </div>

      <StarDisplay rating={entry.rating} />

      {entry.note && (
        <p className="text-sm text-text-secondary mt-2 italic">
          &ldquo;{entry.note}&rdquo;
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-text-muted mt-3">
        <span className="px-2 py-0.5 rounded-full bg-bg-primary">
          {idea.category.replace("-", " ")}
        </span>
        {idea.specificLocation && (
          <span className="flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {idea.specificLocation}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { entries, loading } = useAllDateHistory();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?next=/history");
    }
  }, [user, authLoading, router]);

  // Compute stats
  const stats = useMemo(() => {
    if (entries.length === 0) return null;

    const ratedEntries = entries.filter((e) => e.rating !== null);
    const avgRating =
      ratedEntries.length > 0
        ? ratedEntries.reduce((sum, e) => sum + (e.rating || 0), 0) /
          ratedEntries.length
        : 0;

    // Streak calculation: count consecutive weeks with at least one date
    const now = new Date();
    let streak = 0;
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < 52; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * weekMs);
      const weekEnd = new Date(now.getTime() - i * weekMs);
      const hasDate = entries.some((e) => {
        const d = new Date(e.completed_at);
        return d >= weekStart && d < weekEnd;
      });
      if (hasDate) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Top category
    const categoryCounts: Record<string, number> = {};
    entries.forEach((e) => {
      const idea = allIdeas.find((i) => i.id === e.idea_id);
      if (idea) {
        categoryCounts[idea.category] =
          (categoryCounts[idea.category] || 0) + 1;
      }
    });
    const topCategory = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    // Total spent
    const totalSpent = entries.reduce((sum, e) => {
      const idea = allIdeas.find((i) => i.id === e.idea_id);
      return sum + (idea?.estimatedCostDollars || 0);
    }, 0);

    return {
      totalDates: entries.length,
      avgRating: Math.round(avgRating * 10) / 10,
      streak,
      topCategory: topCategory?.replace("-", " ") || "N/A",
      totalSpent,
    };
  }, [entries]);

  // Group entries by month
  const groupedEntries = useMemo(() => {
    const groups: { label: string; entries: DateHistoryEntry[] }[] = [];
    let currentMonth = "";

    entries.forEach((entry) => {
      const date = new Date(entry.completed_at);
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (monthLabel !== currentMonth) {
        currentMonth = monthLabel;
        groups.push({ label: monthLabel, entries: [] });
      }
      groups[groups.length - 1].entries.push(entry);
    });

    return groups;
  }, [entries]);

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-bg-primary">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-4 pb-2 md:max-w-3xl md:mx-auto md:w-full">
        <Link
          href="/"
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
          Date History
        </h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8 md:max-w-3xl md:mx-auto md:w-full">
        <div className="pt-4 pb-2">
          <h2 className="text-2xl font-bold text-text-primary">
            Your date nights
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Every night you made count
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-text-muted">Loading your history...</p>
          </div>
        ) : entries.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-accent-secondary/10 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-accent-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-bold text-text-primary mb-2">
              No dates logged yet
            </h3>
            <p className="text-sm text-text-muted mb-2 max-w-[280px]">
              After a date night, tap &ldquo;We Did This!&rdquo; to log it and
              rate your experience.
            </p>
            <p className="text-xs text-text-muted mb-8 max-w-[240px]">
              Build your story together, one night at a time.
            </p>

            <Link
              href="/concierge"
              className="py-4 px-8 bg-accent-primary text-white font-bold rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              Plan Your First Date
              <svg
                className="w-5 h-5"
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
          </div>
        ) : (
          <>
            {/* Stats cards */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3 mt-4 mb-8"
              >
                <div className="bg-bg-card rounded-2xl border border-border p-4 text-center">
                  <p className="text-3xl font-extrabold text-accent-primary">
                    {stats.totalDates}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Date{stats.totalDates !== 1 ? "s" : ""} completed
                  </p>
                </div>
                <div className="bg-bg-card rounded-2xl border border-border p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-3xl font-extrabold text-amber-500">
                      {stats.avgRating}
                    </p>
                    <svg
                      className="w-5 h-5 text-amber-400 fill-amber-400"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-text-muted mt-1">Avg rating</p>
                </div>
                <div className="bg-bg-card rounded-2xl border border-border p-4 text-center">
                  <p className="text-3xl font-extrabold text-success">
                    {stats.streak}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Week{stats.streak !== 1 ? "s" : ""} streak
                  </p>
                </div>
                <div className="bg-bg-card rounded-2xl border border-border p-4 text-center">
                  <p className="text-xl font-extrabold text-accent-secondary capitalize">
                    {stats.topCategory}
                  </p>
                  <p className="text-xs text-text-muted mt-1">Favorite type</p>
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            {groupedEntries.map((group) => (
              <div key={group.label} className="mb-6">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">
                  {group.label}
                </h3>
                <div className="flex flex-col gap-3">
                  {group.entries.map((entry, i) => (
                    <HistoryCard
                      key={entry.id}
                      entry={entry}
                      idea={allIdeas.find((idea) => idea.id === entry.idea_id)}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Bottom CTA */}
            <div className="text-center mt-4 mb-2">
              <Link
                href="/concierge"
                className="text-accent-primary text-sm font-semibold hover:underline"
              >
                Plan your next date night
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
