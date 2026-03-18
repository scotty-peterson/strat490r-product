"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea, TimeRange } from "@/lib/types";
import { getSuggestedTimeRange } from "@/lib/constants";

const TIME_ORDER: TimeRange[] = ["30", "60", "120", "180+"];

export default function SurpriseButton() {
  const router = useRouter();

  const handleSurprise = useCallback(() => {
    const timeRange = getSuggestedTimeRange();
    const timeIndex = TIME_ORDER.indexOf(timeRange);
    const candidates = (dateIdeas as DateIdea[]).filter(
      (idea) => TIME_ORDER.indexOf(idea.timeRange) <= timeIndex
    );
    if (candidates.length === 0) return;
    const random = candidates[Math.floor(Math.random() * candidates.length)];
    router.push(`/idea/${random.id}`);
  }, [router]);

  return (
    <button
      onClick={handleSurprise}
      className="mt-4 text-sm text-text-muted font-medium hover:text-text-secondary transition-colors underline underline-offset-4 decoration-border"
    >
      Surprise me
    </button>
  );
}
