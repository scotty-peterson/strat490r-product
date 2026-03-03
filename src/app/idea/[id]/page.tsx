"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";

const MOOD_COLORS: Record<string, string> = {
  chill: "bg-blue-500/20 text-blue-300",
  adventurous: "bg-orange-500/20 text-orange-300",
  romantic: "bg-pink-500/20 text-pink-300",
  social: "bg-green-500/20 text-green-300",
  creative: "bg-purple-500/20 text-purple-300",
  active: "bg-red-500/20 text-red-300",
};

const CATEGORY_LABELS: Record<string, string> = {
  "food-drink": "Food & Drink",
  "outdoors-nature": "Outdoors & Nature",
  "arts-culture": "Arts & Culture",
  entertainment: "Entertainment",
  "active-sports": "Active & Sports",
  "creative-diy": "Creative & DIY",
  relaxation: "Relaxation",
  social: "Social",
  learning: "Learning",
  seasonal: "Seasonal",
};

function formatCost(dollars: number): string {
  if (dollars === 0) return "Free";
  return `~$${dollars}`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${hours}h ${remaining}m`;
}

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();

  const idea = useMemo(() => {
    return (dateIdeas as DateIdea[]).find(
      (i) => i.id === params.id
    );
  }, [params.id]);

  const handleShare = useCallback(async () => {
    if (!idea) return;
    const shareData = {
      title: idea.title,
      text: `Check out this date idea: ${idea.title}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  }, [idea]);

  const mapsUrl = useMemo(() => {
    if (!idea?.address) return null;
    const encoded = encodeURIComponent(idea.address);
    const isIOS =
      typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
    return isIOS
      ? `maps://maps.apple.com/?q=${encoded}`
      : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  }, [idea]);

  if (!idea) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg-primary px-6">
        <p className="text-text-muted text-lg mb-4">Idea not found</p>
        <Link
          href="/concierge"
          className="text-accent-primary font-semibold hover:underline"
        >
          Find something else
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => router.back()}
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
        </button>
        <button
          onClick={handleShare}
          className="p-2 -mr-2 text-text-secondary hover:text-text-primary transition-colors"
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
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 px-6 pb-8"
      >
        {/* Category label */}
        <p className="text-xs text-accent-secondary font-semibold uppercase tracking-wider mb-3">
          {CATEGORY_LABELS[idea.category] || idea.category}
        </p>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-text-primary mb-4 leading-tight">
          {idea.title}
        </h1>

        {/* Quick info chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-bg-card border border-border text-text-secondary">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {formatTime(idea.estimatedTimeMinutes)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-bg-card border border-border text-text-secondary">
            {formatCost(idea.estimatedCostDollars)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-bg-card border border-border text-text-secondary">
            {idea.setting === "indoor"
              ? "🏠 Indoor"
              : idea.setting === "outdoor"
                ? "🌲 Outdoor"
                : "🤷 Either"}
          </span>
          {idea.lateNightFriendly && (
            <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary">
              🌙 Late night friendly
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-base text-text-secondary leading-relaxed mb-6">
          {idea.description}
        </p>

        {/* Pro tip */}
        {idea.proTip && (
          <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-2xl p-4 mb-6">
            <p className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-1">
              Pro Tip
            </p>
            <p className="text-sm text-text-primary">{idea.proTip}</p>
          </div>
        )}

        {/* Location */}
        {idea.specificLocation && (
          <div className="bg-bg-card border border-border rounded-2xl p-4 mb-6">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
              Location
            </p>
            <p className="text-sm text-text-primary font-semibold">
              {idea.specificLocation}
            </p>
            {idea.address && (
              <p className="text-xs text-text-muted mt-1">{idea.address}</p>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-accent-primary font-semibold hover:underline"
              >
                Open in Maps
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Mood tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {idea.moods.map((mood) => (
            <span
              key={mood}
              className={`text-xs px-3 py-1.5 rounded-full font-medium ${MOOD_COLORS[mood] || "bg-border text-text-secondary"}`}
            >
              {mood}
            </span>
          ))}
        </div>

        {/* Seasonal note */}
        {idea.seasonalAvailability && (
          <p className="text-xs text-text-muted mb-6">
            Best in:{" "}
            {idea.seasonalAvailability
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(", ")}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleShare}
            className="w-full py-4 bg-accent-primary text-bg-primary font-bold rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Share This Idea
          </button>
          <Link
            href="/concierge"
            className="w-full py-3 text-center text-text-muted text-sm font-medium transition-colors hover:text-text-secondary"
          >
            Find More Ideas
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
