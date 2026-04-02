"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";
import { getCurrentSeason } from "@/lib/constants";
import { useAllDateHistory } from "@/hooks/useDateHistory";

const allIdeas = dateIdeas as DateIdea[];

function getImageUrl(ideaId: string): string {
  const hash = ideaId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${hash}/800/1000`;
}

const CATEGORY_LABELS: Record<string, string> = {
  "food-drink": "Food & Drink",
  "outdoors-nature": "Outdoors",
  "arts-culture": "Arts & Culture",
  entertainment: "Entertainment",
  "active-sports": "Active",
  "creative-diy": "Creative",
  relaxation: "Relaxation",
  social: "Social",
  learning: "Learning",
  seasonal: "Seasonal",
};

function SwipeCard({
  idea,
  onSwipe,
  isTop,
}: {
  idea: DateIdea;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, zIndex: isTop ? 10 : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      exit={{
        x: 300,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
    >
      <div className="h-full rounded-3xl overflow-hidden shadow-xl border-2 border-border bg-bg-card relative">
        {/* Image */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl(idea.id)}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Like / Nope indicators */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-8 left-6 z-20 px-4 py-2 border-4 border-green-500 rounded-xl rotate-[-15deg]"
            >
              <span className="text-2xl font-extrabold text-green-500 tracking-wider">SAVE</span>
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-8 right-6 z-20 px-4 py-2 border-4 border-red-400 rounded-xl rotate-[15deg]"
            >
              <span className="text-2xl font-extrabold text-red-400 tracking-wider">SKIP</span>
            </motion.div>
          </>
        )}

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
            {CATEGORY_LABELS[idea.category] || idea.category}
          </p>
          <h2 className="text-2xl font-extrabold text-white leading-tight mb-2">
            {idea.title}
          </h2>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-4">
            {idea.description}
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-white/50 font-medium px-2.5 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
              {idea.estimatedCostDollars === 0 ? "Free" : `$${idea.estimatedCostDollars}`}
            </span>
            <span className="text-xs text-white/50 font-medium px-2.5 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
              {idea.estimatedTimeMinutes < 60
                ? `${idea.estimatedTimeMinutes}m`
                : `${Math.floor(idea.estimatedTimeMinutes / 60)}h${idea.estimatedTimeMinutes % 60 ? ` ${idea.estimatedTimeMinutes % 60}m` : ""}`}
            </span>
            <span className="text-xs text-white/50 font-medium px-2.5 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
              {idea.setting === "indoor" ? "Indoor" : idea.setting === "outdoor" ? "Outdoor" : "Either"}
            </span>
            {idea.specificLocation && (
              <span className="text-xs text-white/50 font-medium px-2.5 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                {idea.specificLocation}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SwipePage() {
  const router = useRouter();
  const { completedIdeaIds } = useAllDateHistory();
  const season = useMemo(() => getCurrentSeason(), []);

  const deck = useMemo(() => {
    const filtered = allIdeas.filter((idea) => {
      if (completedIdeaIds.has(idea.id)) return false;
      if (idea.seasonalAvailability && idea.seasonalAvailability.length > 0) {
        if (!idea.seasonalAvailability.includes(season)) return false;
      }
      return true;
    });
    // Shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return filtered;
  }, [completedIdeaIds, season]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<{ title: string; action: "saved" | "skipped" } | null>(null);

  const visibleCards = useMemo(() => {
    return deck.slice(currentIndex, currentIndex + 2);
  }, [deck, currentIndex]);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      const idea = deck[currentIndex];
      if (!idea) return;

      if (direction === "right") {
        setSaved((prev) => [...prev, idea.id]);
        setLastAction({ title: idea.title, action: "saved" });
      } else {
        setLastAction({ title: idea.title, action: "skipped" });
      }

      setTimeout(() => setLastAction(null), 1500);
      setCurrentIndex((i) => i + 1);
    },
    [deck, currentIndex]
  );

  const handleButtonSwipe = useCallback(
    (direction: "left" | "right") => {
      handleSwipe(direction);
    },
    [handleSwipe]
  );

  const isDone = currentIndex >= deck.length;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-4 pb-2 md:max-w-lg md:mx-auto md:w-full z-20 relative">
        <Link
          href="/"
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="text-center">
          <p className="text-xs font-semibold text-text-muted tracking-wide uppercase">Discover</p>
        </div>
        <div className="flex items-center gap-1">
          {saved.length > 0 && (
            <span className="text-xs font-bold text-accent-primary bg-accent-primary/10 px-2 py-1 rounded-full">
              {saved.length} saved
            </span>
          )}
        </div>
      </div>

      {/* Card stack */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 md:max-w-lg md:mx-auto md:w-full relative">
        {isDone ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              You&apos;ve seen them all!
            </h2>
            <p className="text-sm text-text-muted mb-6">
              {saved.length > 0
                ? `You saved ${saved.length} idea${saved.length !== 1 ? "s" : ""}. Nice taste.`
                : "Swipe through again or try the concierge."}
            </p>
            <div className="flex flex-col gap-3">
              {saved.length > 0 && (
                <button
                  onClick={() => router.push(`/idea/${saved[0]}`)}
                  className="px-6 py-3 bg-accent-primary text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  View your top pick
                </button>
              )}
              <Link
                href="/concierge"
                className="px-6 py-3 bg-bg-card border-2 border-border text-text-primary font-semibold rounded-2xl text-center transition-all hover:border-accent-primary active:scale-[0.98]"
              >
                Try the concierge instead
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Toast */}
            <AnimatePresence>
              {lastAction && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute top-0 z-30 px-4 py-2 rounded-full text-xs font-semibold ${
                    lastAction.action === "saved"
                      ? "bg-green-100 text-green-700"
                      : "bg-bg-card border border-border text-text-muted"
                  }`}
                >
                  {lastAction.action === "saved" ? "Saved!" : "Skipped"}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cards */}
            <div className="relative w-full aspect-[3/4] max-h-[520px]">
              <AnimatePresence>
                {visibleCards.map((idea, i) => (
                  <SwipeCard
                    key={idea.id}
                    idea={idea}
                    onSwipe={handleSwipe}
                    isTop={i === 0}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-6 mt-6">
              <button
                onClick={() => handleButtonSwipe("left")}
                className="w-14 h-14 rounded-full bg-bg-card border-2 border-border flex items-center justify-center text-text-muted hover:border-red-300 hover:text-red-400 transition-colors active:scale-90"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <button
                onClick={() => {
                  const idea = deck[currentIndex];
                  if (idea) router.push(`/idea/${idea.id}`);
                }}
                className="w-11 h-11 rounded-full bg-bg-card border-2 border-border flex items-center justify-center text-accent-secondary hover:border-accent-secondary transition-colors active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </button>

              <button
                onClick={() => handleButtonSwipe("right")}
                className="w-14 h-14 rounded-full bg-bg-card border-2 border-border flex items-center justify-center text-text-muted hover:border-green-300 hover:text-green-500 transition-colors active:scale-90"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>

            {/* Counter */}
            <p className="text-xs text-text-muted mt-3">
              {currentIndex + 1} of {deck.length}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
