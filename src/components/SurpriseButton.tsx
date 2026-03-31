"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea, TimeRange } from "@/lib/types";
import { getSuggestedTimeRange, getCurrentSeason } from "@/lib/constants";

const TIME_ORDER: TimeRange[] = ["30", "60", "120", "180+"];

export default function SurpriseButton() {
  const router = useRouter();

  const handleSurprise = useCallback(() => {
    const timeRange = getSuggestedTimeRange();
    const season = getCurrentSeason();
    const timeIndex = TIME_ORDER.indexOf(timeRange);
    const candidates = (dateIdeas as DateIdea[]).filter((idea) => {
      if (TIME_ORDER.indexOf(idea.timeRange) > timeIndex) return false;
      // Filter out ideas that aren't in season
      if (idea.seasonalAvailability && idea.seasonalAvailability.length > 0) {
        if (!idea.seasonalAvailability.includes(season)) return false;
      }
      return true;
    });
    if (candidates.length === 0) return;
    const random = candidates[Math.floor(Math.random() * candidates.length)];
    router.push(`/idea/${random.id}`);
  }, [router]);

  return (
    <button
      onClick={handleSurprise}
      className="mt-4 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-accent-primary bg-accent-primary/10 border border-accent-primary/25 rounded-2xl transition-all duration-200 hover:bg-accent-primary/20 hover:scale-[1.02] active:scale-[0.98]"
    >
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
          d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
        />
      </svg>
      Surprise Me
    </button>
  );
}
