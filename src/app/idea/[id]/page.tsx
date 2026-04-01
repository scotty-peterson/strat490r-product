"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useCallback, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useSavedIdea } from "@/hooks/useSavedIdea";
import { useDateHistory } from "@/hooks/useDateHistory";
import RatingModal from "@/components/RatingModal";
import { getCurrentSeason, getSeasonLabel, type Season } from "@/lib/constants";

const SEASON_COLORS: Record<Season, string> = {
  spring: "bg-green-50 border-green-200 text-green-700",
  summer: "bg-amber-50 border-amber-200 text-amber-700",
  fall: "bg-orange-50 border-orange-200 text-orange-700",
  winter: "bg-sky-50 border-sky-200 text-sky-700",
};

const MOOD_COLORS: Record<string, string> = {
  chill: "bg-blue-50 text-blue-700",
  adventurous: "bg-orange-50 text-orange-700",
  romantic: "bg-pink-50 text-pink-700",
  social: "bg-green-50 text-green-700",
  creative: "bg-purple-50 text-purple-700",
  active: "bg-red-50 text-red-700",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "food-drink": "from-amber-900/60 to-orange-800/30",
  "outdoors-nature": "from-emerald-900/60 to-green-700/30",
  "arts-culture": "from-violet-900/60 to-purple-700/30",
  entertainment: "from-rose-900/60 to-pink-700/30",
  "active-sports": "from-sky-900/60 to-blue-700/30",
  "creative-diy": "from-fuchsia-900/60 to-pink-600/30",
  relaxation: "from-teal-900/60 to-cyan-700/30",
  social: "from-yellow-900/60 to-amber-600/30",
  learning: "from-indigo-900/60 to-blue-800/30",
  seasonal: "from-orange-900/60 to-red-700/30",
};

function getImageUrl(ideaId: string): string {
  const hash = ideaId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${hash}/1200/600`;
}

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
  const { user } = useAuth();
  const ideaId = typeof params.id === "string" ? params.id : "";
  const { isSaved, toggle, loading: saveLoading } = useSavedIdea(ideaId);
  const {
    entry: historyEntry,
    isCompleted,
    loading: historyLoading,
    markCompleted,
    updateEntry,
    removeEntry,
  } = useDateHistory(ideaId);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const idea = useMemo(() => {
    return (dateIdeas as DateIdea[]).find(
      (i) => i.id === params.id
    );
  }, [params.id]);

  const currentSeason = useMemo(() => getCurrentSeason(), []);

  const relatedIdeas = useMemo(() => {
    if (!idea) return [];
    const allIdeas = dateIdeas as DateIdea[];
    const season = getCurrentSeason();

    return allIdeas
      .filter((other) => {
        if (other.id === idea.id) return false;
        // Must be in season
        if (other.seasonalAvailability && other.seasonalAvailability.length > 0) {
          if (!other.seasonalAvailability.includes(season)) return false;
        }
        return true;
      })
      .map((other) => {
        // Score by mood overlap + same category bonus
        const moodOverlap = other.moods.filter((m) => idea.moods.includes(m)).length;
        const categoryBonus = other.category === idea.category ? 2 : 0;
        const budgetClose = Math.abs(other.estimatedCostDollars - idea.estimatedCostDollars) < 20 ? 1 : 0;
        return { idea: other, score: moodOverlap * 3 + categoryBonus + budgetClose };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((s) => s.idea);
  }, [idea]);

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

  const handleSave = useCallback(async () => {
    if (!user) {
      router.push(`/auth?next=/idea/${ideaId}`);
      return;
    }
    await toggle();
  }, [user, toggle, router, ideaId]);

  const handleWeDidThis = useCallback(() => {
    if (!user) {
      router.push(`/auth?next=/idea/${ideaId}`);
      return;
    }
    setShowRatingModal(true);
  }, [user, router, ideaId]);

  const handleRatingSubmit = useCallback(
    async (rating: number, note?: string) => {
      if (isCompleted) {
        await updateEntry(rating, note);
      } else {
        await markCompleted(rating, note);
      }
      setShowRatingModal(false);
    },
    [isCompleted, markCompleted, updateEntry]
  );

  const handleUndoCompleted = useCallback(async () => {
    await removeEntry();
  }, [removeEntry]);

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

  const imageUrl = useMemo(() => getImageUrl(idea.id), [idea.id]);
  const gradient = CATEGORY_GRADIENTS[idea.category] || "from-gray-900/60 to-gray-700/30";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Hero image with overlaid nav */}
      <div className="relative h-72 md:h-96 overflow-hidden md:max-w-2xl md:mx-auto md:w-full md:rounded-b-3xl">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Nav buttons on image */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 md:px-8 pt-4 pb-2">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-white/90 hover:text-white transition-colors"
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

          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="p-2 text-white/90 hover:text-white transition-colors disabled:opacity-50"
              aria-label={isSaved ? "Unsave idea" : "Save idea"}
            >
              <svg
                className={`w-6 h-6 transition-all duration-200 ${isSaved ? "fill-accent-primary text-accent-primary scale-110" : "fill-none"}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <button
              onClick={handleShare}
              className="p-2 -mr-2 text-white/90 hover:text-white transition-colors"
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
        </div>

        {/* Category + title overlaid on bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <p className="text-xs text-white/70 font-semibold uppercase tracking-wider mb-1.5">
            {CATEGORY_LABELS[idea.category] || idea.category}
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-sm">
            {idea.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 px-6 pt-6 pb-8 md:max-w-2xl md:mx-auto md:w-full"
      >

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
              ? "Indoor"
              : idea.setting === "outdoor"
                ? "Outdoor"
                : "Either"}
          </span>
          {idea.lateNightFriendly && (
            <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary">
              Late night friendly
            </span>
          )}
          {idea.seasonalAvailability && idea.seasonalAvailability.includes(currentSeason) && (
            <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border ${SEASON_COLORS[currentSeason]}`}>
              In season
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

        {/* Quick action buttons */}
        {idea.address && (
          <div className="flex gap-3 mb-6">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-accent-primary text-white font-semibold rounded-2xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Get Directions
              </a>
            )}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent((idea.specificLocation || idea.title) + " Provo UT")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-bg-card border-2 border-border text-text-primary font-semibold rounded-2xl text-sm transition-all duration-200 hover:border-accent-primary active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Look Up
            </a>
          </div>
        )}

        {/* Completed banner */}
        {isCompleted && historyEntry && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-success/10 border border-success/20 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm font-bold text-success">
                  You did this!
                </span>
              </div>
              <span className="text-xs text-text-muted">
                {new Date(historyEntry.completed_at).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                )}
              </span>
            </div>
            {historyEntry.rating && (
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      star <= historyEntry.rating!
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
            )}
            {historyEntry.note && (
              <p className="text-sm text-text-secondary italic mt-1">
                &ldquo;{historyEntry.note}&rdquo;
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setShowRatingModal(true)}
                className="text-xs text-accent-primary font-medium hover:underline"
              >
                Edit rating
              </button>
              <span className="text-xs text-text-muted">·</span>
              <button
                onClick={handleUndoCompleted}
                disabled={historyLoading}
                className="text-xs text-text-muted font-medium hover:text-error transition-colors"
              >
                Remove
              </button>
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-4">
          {/* "We Did This!" button — primary when not yet completed */}
          {!isCompleted && (
            <button
              onClick={handleWeDidThis}
              disabled={historyLoading}
              className="w-full py-4 font-bold rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2 bg-success text-white"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              We Did This!
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className={`w-full py-4 font-bold rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2 ${
              isSaved
                ? "bg-accent-primary/20 border-2 border-accent-primary text-accent-primary"
                : isCompleted
                  ? "bg-accent-primary text-white"
                  : "bg-bg-card border-2 border-border text-text-primary hover:border-accent-primary"
            }`}
          >
            <svg
              className={`w-5 h-5 ${isSaved ? "fill-accent-primary" : isCompleted ? "fill-white" : "fill-none"}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {user
              ? isSaved
                ? "Saved"
                : "Save This Idea"
              : "Save This Idea"}
          </button>
          <button
            onClick={handleShare}
            className="w-full py-3 border-2 border-border text-text-secondary font-semibold rounded-2xl text-sm transition-all duration-200 hover:border-accent-primary hover:text-text-primary active:scale-[0.98]"
          >
            Share
          </button>
          {isSaved && user && (
            <Link
              href="/saved"
              className="w-full py-3 text-center text-accent-primary text-sm font-semibold transition-colors hover:opacity-80"
            >
              View all saved ideas →
            </Link>
          )}
          {user && (
            <Link
              href="/history"
              className="w-full py-3 text-center text-accent-secondary text-sm font-semibold transition-colors hover:opacity-80"
            >
              View date history →
            </Link>
          )}
          <Link
            href="/concierge"
            className="w-full py-3 text-center text-text-muted text-sm font-medium transition-colors hover:text-text-secondary"
          >
            Find More Ideas
          </Link>
        </div>

        {/* Related ideas */}
        {relatedIdeas.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">
              You might also like
            </h3>
            <div className="flex flex-col gap-3">
              {relatedIdeas.map((related) => (
                <Link
                  key={related.id}
                  href={`/idea/${related.id}`}
                  className="flex items-center gap-4 p-3 bg-bg-card border border-border rounded-2xl hover:border-border-hover transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={`https://picsum.photos/seed/${related.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)}/200/200`}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary line-clamp-2 leading-snug">
                      {related.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {formatTime(related.estimatedTimeMinutes)} · {formatCost(related.estimatedCostDollars)}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Rating Modal */}
        <RatingModal
          isOpen={showRatingModal}
          ideaTitle={idea.title}
          initialRating={historyEntry?.rating || 0}
          initialNote={historyEntry?.note || ""}
          onSubmit={handleRatingSubmit}
          onClose={() => setShowRatingModal(false)}
          isEditing={isCompleted}
        />
      </motion.div>
    </div>
  );
}
