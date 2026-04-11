"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useAllDateHistory } from "@/hooks/useDateHistory";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea, Category } from "@/lib/types";

const allIdeas = dateIdeas as DateIdea[];

// ── Category emoji map ──────────────────────────────────────────────
const categoryEmoji: Record<Category, string> = {
  "food-drink": "\u{1F37D}\uFE0F",
  "outdoors-nature": "\u{1F3D5}\uFE0F",
  "arts-culture": "\u{1F3A8}",
  entertainment: "\u{1F3AC}",
  "active-sports": "\u{1F3C3}",
  "creative-diy": "\u{2702}\uFE0F",
  relaxation: "\u{1F9D6}",
  social: "\u{1F389}",
  learning: "\u{1F4DA}",
  seasonal: "\u{1F341}",
};

const categoryLabel: Record<Category, string> = {
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

// ── Slide gradient backgrounds ──────────────────────────────────────
const slideGradients = [
  "from-violet-600 via-indigo-600 to-purple-800",
  "from-rose-500 via-pink-500 to-fuchsia-600",
  "from-amber-500 via-orange-500 to-red-500",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-sky-500 via-blue-500 to-indigo-600",
  "from-pink-500 via-rose-400 to-orange-400",
  "from-indigo-600 via-purple-600 to-pink-600",
];

// ── Animated counter hook ───────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1600, active = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (target === 0) {
      setValue(0);
      return;
    }

    let start: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, active]);

  return value;
}

// ── Computed stats type ─────────────────────────────────────────────
interface WrappedStats {
  totalDates: number;
  totalHours: number;
  topCategory: Category | null;
  topCategoryCount: number;
  topCategoryPct: number;
  avgRating: number;
  highestRatedTitle: string;
  highestRatedScore: number;
  totalSpent: number;
  avgCostPerDate: number;
  favoriteSpot: string | null;
  favoriteSpotCount: number;
}

// ── Slide components ────────────────────────────────────────────────
const slideVariants = {
  enter: { opacity: 0, scale: 0.92, y: 30 },
  center: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.05, y: -20 },
};

const slideTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 26,
  mass: 0.8,
};

function SlideIntro() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full text-center px-8"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <span className="text-7xl mb-6 block">{"\u{2728}"}</span>
      </motion.div>
      <motion.h1
        className="text-5xl font-black tracking-tight mb-4"
        style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Your Date Story
      </motion.h1>
      <motion.p
        className="text-xl text-white/80 max-w-xs leading-relaxed"
        style={{ textShadow: "0 1px 8px rgba(0,0,0,0.2)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        Here&apos;s how you&apos;ve been spending your date nights
      </motion.p>
      <motion.p
        className="mt-12 text-sm text-white/50 tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Tap to continue
      </motion.p>
    </motion.div>
  );
}

function SlideTotalDates({
  stats,
  active,
}: {
  stats: WrappedStats;
  active: boolean;
}) {
  const count = useAnimatedCounter(stats.totalDates, 1400, active);
  const hours = useAnimatedCounter(
    Math.round(stats.totalHours),
    1800,
    active
  );

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full text-center px-8"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
        className="text-[8rem] font-black leading-none tabular-nums"
        style={{ textShadow: "0 4px 30px rgba(0,0,0,0.3)" }}
      >
        {count}
      </motion.div>
      <motion.p
        className="text-2xl font-semibold text-white/90 mt-2"
        style={{ textShadow: "0 1px 8px rgba(0,0,0,0.2)" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        date nights and counting
      </motion.p>
      <motion.div
        className="mt-8 bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <span className="text-4xl font-bold tabular-nums">{hours}</span>
        <span className="text-lg text-white/70 ml-2">hours together</span>
      </motion.div>
    </motion.div>
  );
}

function SlideTopCategory({
  stats,
}: {
  stats: WrappedStats;
}) {
  if (!stats.topCategory) return null;

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full text-center px-8"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
    >
      <motion.span
        className="text-8xl mb-6 block"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.2 }}
      >
        {categoryEmoji[stats.topCategory]}
      </motion.span>
      <motion.p
        className="text-lg text-white/60 uppercase tracking-widest font-medium mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Your go-to vibe
      </motion.p>
      <motion.h2
        className="text-4xl font-black"
        style={{ textShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {categoryLabel[stats.topCategory]}
      </motion.h2>
      <motion.div
        className="mt-6 bg-white/15 backdrop-blur-sm rounded-full px-6 py-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
      >
        <span className="text-xl font-bold">
          {stats.topCategoryPct}%
        </span>
        <span className="text-white/70 ml-2">of your dates</span>
      </motion.div>
    </motion.div>
  );
}

function SlideRatingStats({
  stats,
  active,
}: {
  stats: WrappedStats;
  active: boolean;
}) {
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => setShowStars(true), 600);
      return () => clearTimeout(timer);
    } else {
      setShowStars(false);
    }
  }, [active]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full text-center px-8"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
    >
      <motion.div
        className="text-7xl font-black tabular-nums"
        style={{ textShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
      >
        {stats.avgRating.toFixed(1)}
      </motion.div>
      <div className="flex gap-2 my-4 h-10 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.svg
            key={star}
            className="w-8 h-8"
            viewBox="0 0 24 24"
            initial={{ opacity: 0, scale: 0 }}
            animate={
              showStars
                ? {
                    opacity: 1,
                    scale: 1,
                    fill:
                      star <= Math.round(stats.avgRating)
                        ? "#fbbf24"
                        : "rgba(255,255,255,0.2)",
                    color:
                      star <= Math.round(stats.avgRating)
                        ? "#fbbf24"
                        : "rgba(255,255,255,0.3)",
                  }
                : {}
            }
            transition={{
              delay: 0.8 + star * 0.12,
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </motion.svg>
        ))}
      </div>
      <motion.p
        className="text-xl text-white/80"
        style={{ textShadow: "0 1px 8px rgba(0,0,0,0.2)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        average rating out of 5
      </motion.p>
      {stats.highestRatedTitle && (
        <motion.div
          className="mt-8 bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 max-w-xs"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-sm text-white/60 mb-1">Top-rated date</p>
          <p className="text-lg font-bold">{stats.highestRatedTitle}</p>
          <p className="text-white/70 text-sm mt-1">
            {stats.highestRatedScore} / 5 {"\u2B50"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function SlideMoneyStats({
  stats,
  active,
}: {
  stats: WrappedStats;
  active: boolean;
}) {
  const total = useAnimatedCounter(
    Math.round(stats.totalSpent),
    1800,
    active
  );
  const avg = useAnimatedCounter(
    Math.round(stats.avgCostPerDate),
    1400,
    active
  );

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full text-center px-8"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
    >
      <motion.p
        className="text-lg text-white/60 uppercase tracking-widest font-medium mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        You&apos;ve invested
      </motion.p>
      <motion.div
        className="text-7xl font-black tabular-nums"
        style={{ textShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.3 }}
      >
        ${total}
      </motion.div>
      <motion.p
        className="text-xl text-white/80 mt-2"
        style={{ textShadow: "0 1px 8px rgba(0,0,0,0.2)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        in your relationship
      </motion.p>
      <motion.div
        className="mt-8 bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <span className="text-3xl font-bold tabular-nums">${avg}</span>
        <span className="text-white/70 ml-2">avg per date</span>
      </motion.div>
    </motion.div>
  );
}

function SlideFavoriteSpot({ stats }: { stats: WrappedStats }) {
  if (!stats.favoriteSpot) return null;

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full text-center px-8"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
    >
      <motion.span
        className="text-7xl mb-6 block"
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.2 }}
      >
        {"\u{1F4CD}"}
      </motion.span>
      <motion.p
        className="text-lg text-white/60 uppercase tracking-widest font-medium mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Your spot
      </motion.p>
      <motion.h2
        className="text-4xl font-black max-w-sm"
        style={{ textShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {stats.favoriteSpot}
      </motion.h2>
      <motion.div
        className="mt-6 bg-white/15 backdrop-blur-sm rounded-full px-6 py-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
      >
        <span className="text-xl font-bold">{stats.favoriteSpotCount}x</span>
        <span className="text-white/70 ml-2">visited</span>
      </motion.div>
    </motion.div>
  );
}

function SlideOutro() {
  const handleShare = async () => {
    const shareData = {
      title: "My Date Wrapped",
      text: "Check out my date night stats on Rendition!",
      url: window.location.origin + "/wrapped",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full text-center px-8"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
    >
      <motion.span
        className="text-7xl mb-6 block"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
      >
        {"\u{1F496}"}
      </motion.span>
      <motion.h2
        className="text-4xl font-black mb-3"
        style={{ textShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Keep the streak going
      </motion.h2>
      <motion.p
        className="text-lg text-white/70 mb-10 max-w-xs"
        style={{ textShadow: "0 1px 8px rgba(0,0,0,0.2)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Your next great date night is waiting
      </motion.p>
      <motion.div
        className="flex flex-col gap-3 w-full max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Link
          href="/concierge"
          className="w-full py-4 bg-white text-indigo-700 font-bold text-lg rounded-2xl text-center transition-transform active:scale-95 shadow-lg"
        >
          Find Your Next Date
        </Link>
        <button
          onClick={handleShare}
          className="w-full py-4 bg-white/15 backdrop-blur-sm text-white font-semibold text-lg rounded-2xl border border-white/20 transition-transform active:scale-95"
        >
          Share Your Wrapped
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Progress dots ───────────────────────────────────────────────────
function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          animate={{
            width: i === current ? 24 : 8,
            height: 8,
            backgroundColor:
              i === current ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      ))}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 flex flex-col items-center justify-center text-white px-8 text-center">
      <motion.span
        className="text-7xl mb-6 block"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {"\u{1F3AC}"}
      </motion.span>
      <motion.h1
        className="text-3xl font-black mb-3"
        style={{ textShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        No dates yet!
      </motion.h1>
      <motion.p
        className="text-lg text-white/70 mb-8 max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Complete some date nights and come back to see your story unfold
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Link
          href="/concierge"
          className="px-8 py-4 bg-white text-indigo-700 font-bold text-lg rounded-2xl inline-block transition-transform active:scale-95 shadow-lg"
        >
          Plan Your First Date
        </Link>
      </motion.div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────
export default function WrappedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { entries, loading } = useAllDateHistory();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?next=/wrapped");
    }
  }, [user, authLoading, router]);

  // Compute stats
  const stats = useMemo<WrappedStats | null>(() => {
    if (entries.length === 0) return null;

    const ideaMap = new Map(allIdeas.map((idea) => [idea.id, idea]));

    // Total dates
    const totalDates = entries.length;

    // Total hours
    const totalMinutes = entries.reduce((sum, e) => {
      const idea = ideaMap.get(e.idea_id);
      return sum + (idea?.estimatedTimeMinutes || 0);
    }, 0);
    const totalHours = totalMinutes / 60;

    // Top category
    const categoryCounts: Record<string, number> = {};
    entries.forEach((e) => {
      const idea = ideaMap.get(e.idea_id);
      if (idea) {
        categoryCounts[idea.category] =
          (categoryCounts[idea.category] || 0) + 1;
      }
    });
    const topCategoryEntry = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const topCategory = topCategoryEntry
      ? (topCategoryEntry[0] as Category)
      : null;
    const topCategoryCount = topCategoryEntry ? topCategoryEntry[1] : 0;
    const topCategoryPct =
      totalDates > 0 ? Math.round((topCategoryCount / totalDates) * 100) : 0;

    // Rating stats
    const ratedEntries = entries.filter((e) => e.rating !== null);
    const avgRating =
      ratedEntries.length > 0
        ? ratedEntries.reduce((sum, e) => sum + (e.rating || 0), 0) /
          ratedEntries.length
        : 0;

    let highestRatedTitle = "";
    let highestRatedScore = 0;
    ratedEntries.forEach((e) => {
      if ((e.rating || 0) > highestRatedScore) {
        highestRatedScore = e.rating || 0;
        const idea = ideaMap.get(e.idea_id);
        highestRatedTitle = idea?.title || "";
      }
    });

    // Money stats
    const totalSpent = entries.reduce((sum, e) => {
      const idea = ideaMap.get(e.idea_id);
      return sum + (idea?.estimatedCostDollars || 0);
    }, 0);
    const avgCostPerDate = totalDates > 0 ? totalSpent / totalDates : 0;

    // Favorite spot
    const locationCounts: Record<string, number> = {};
    entries.forEach((e) => {
      const idea = ideaMap.get(e.idea_id);
      if (idea?.specificLocation) {
        locationCounts[idea.specificLocation] =
          (locationCounts[idea.specificLocation] || 0) + 1;
      }
    });
    const topLocationEntry = Object.entries(locationCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const favoriteSpot = topLocationEntry ? topLocationEntry[0] : null;
    const favoriteSpotCount = topLocationEntry ? topLocationEntry[1] : 0;

    return {
      totalDates,
      totalHours,
      topCategory,
      topCategoryCount,
      topCategoryPct,
      avgRating,
      highestRatedTitle,
      highestRatedScore,
      totalSpent,
      avgCostPerDate,
      favoriteSpot,
      favoriteSpotCount,
    };
  }, [entries]);

  // Build slide list dynamically (skip favorite spot if none)
  const slides = useMemo(() => {
    if (!stats) return [];
    const s: string[] = [
      "intro",
      "totalDates",
      "topCategory",
      "ratingStats",
      "moneyStats",
    ];
    if (stats.favoriteSpot) s.push("favoriteSpot");
    s.push("outro");
    return s;
  }, [stats]);

  const totalSlides = slides.length;

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  // Swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  // Loading & auth states
  if (authLoading || loading) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  if (!user) return null;

  if (!stats) return <EmptyState />;

  const currentGradient =
    slideGradients[currentSlide % slideGradients.length];

  const renderSlide = () => {
    const slideKey = slides[currentSlide];
    switch (slideKey) {
      case "intro":
        return <SlideIntro key="intro" />;
      case "totalDates":
        return (
          <SlideTotalDates
            key="totalDates"
            stats={stats}
            active={slideKey === slides[currentSlide]}
          />
        );
      case "topCategory":
        return <SlideTopCategory key="topCategory" stats={stats} />;
      case "ratingStats":
        return (
          <SlideRatingStats
            key="ratingStats"
            stats={stats}
            active={slideKey === slides[currentSlide]}
          />
        );
      case "moneyStats":
        return (
          <SlideMoneyStats
            key="moneyStats"
            stats={stats}
            active={slideKey === slides[currentSlide]}
          />
        );
      case "favoriteSpot":
        return <SlideFavoriteSpot key="favoriteSpot" stats={stats} />;
      case "outro":
        return <SlideOutro key="outro" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`min-h-dvh bg-gradient-to-br ${currentGradient} text-white select-none overflow-hidden relative`}
      onClick={goNext}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      animate={{ background: undefined }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 45, 0],
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-48 -left-48 w-[30rem] h-[30rem] rounded-full bg-white/5"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -30, 0],
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        />
      </div>

      {/* Back button (top-left, only visible after first slide) */}
      {currentSlide > 0 && (
        <motion.button
          className="fixed top-6 left-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous slide"
        >
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
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </motion.button>
      )}

      {/* Close / exit link */}
      <Link
        href="/history"
        className="fixed top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/10"
        onClick={(e) => e.stopPropagation()}
        aria-label="Close"
      >
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </Link>

      {/* Slide content */}
      <AnimatePresence mode="wait">{renderSlide()}</AnimatePresence>

      {/* Progress dots */}
      <ProgressDots total={totalSlides} current={currentSlide} />

      {/* Next button on last-but-not-last slides */}
      {currentSlide < totalSlides - 1 && (
        <motion.button
          className="fixed bottom-20 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/15"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next slide"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
}
