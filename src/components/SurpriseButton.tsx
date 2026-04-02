"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea, TimeRange } from "@/lib/types";
import { getSuggestedTimeRange, getCurrentSeason } from "@/lib/constants";

const TIME_ORDER: TimeRange[] = ["30", "60", "120", "180+"];

export default function SurpriseButton() {
  const router = useRouter();
  const [shuffling, setShuffling] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const getCandidates = useCallback(() => {
    const timeRange = getSuggestedTimeRange();
    const season = getCurrentSeason();
    const timeIndex = TIME_ORDER.indexOf(timeRange);
    return (dateIdeas as DateIdea[]).filter((idea) => {
      if (TIME_ORDER.indexOf(idea.timeRange) > timeIndex) return false;
      if (idea.seasonalAvailability && idea.seasonalAvailability.length > 0) {
        if (!idea.seasonalAvailability.includes(season)) return false;
      }
      return true;
    });
  }, []);

  const handleSurprise = useCallback(() => {
    const candidates = getCandidates();
    if (candidates.length === 0) return;

    setShuffling(true);

    // Show 6 rapid title flashes, then land on the final pick
    let count = 0;
    const totalFlashes = 6;
    const interval = setInterval(() => {
      const rand = candidates[Math.floor(Math.random() * candidates.length)];
      setPreview(rand.title);
      count++;
      if (count >= totalFlashes) {
        clearInterval(interval);
        const final = candidates[Math.floor(Math.random() * candidates.length)];
        setPreview(final.title);
        setTimeout(() => {
          setShuffling(false);
          setPreview(null);
          router.push(`/idea/${final.id}`);
        }, 600);
      }
    }, 120);
  }, [router, getCandidates]);

  return (
    <div className="relative">
      <button
        onClick={handleSurprise}
        disabled={shuffling}
        className="mt-4 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-accent-primary bg-accent-primary/10 border border-accent-primary/25 rounded-2xl transition-all duration-200 hover:bg-accent-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
      >
        <motion.svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          animate={shuffling ? { rotate: 360 } : { rotate: 0 }}
          transition={shuffling ? { duration: 0.6, repeat: Infinity, ease: "linear" } : {}}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
          />
        </motion.svg>
        {shuffling ? "Shuffling..." : "Surprise Me"}
      </button>

      {/* Floating preview title during shuffle */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-4 py-2 bg-text-primary text-white text-xs font-semibold rounded-xl whitespace-nowrap shadow-lg max-w-[280px] truncate"
          >
            {preview}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
