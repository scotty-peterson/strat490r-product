"use client";

import { useMemo } from "react";
import { getCurrentSeason, getTimeOfDay, type Season } from "@/lib/constants";

const SEASON_SUBTITLES: Record<Season, string[]> = {
  spring: [
    "Warm nights are back. Make them count.",
    "Perfect weather for something spontaneous.",
    "The canyon is calling. Or maybe just a patio.",
  ],
  summer: [
    "Long nights, no excuses.",
    "Too nice out to stay in. Probably.",
    "Summer in Provo hits different with a plan.",
  ],
  fall: [
    "Hoodie weather. Date weather.",
    "Canyon colors and cool air. Go see them together.",
    "The best season for a night out in Provo.",
  ],
  winter: [
    "Cold outside. Cozy inside. Either way, go.",
    "Snow on the mountains, warmth on the agenda.",
    "Winter nights are for making memories, not movies.",
  ],
};

const TIME_CTA: Record<ReturnType<typeof getTimeOfDay>, string> = {
  morning: "Plan Tonight",
  afternoon: "Find Your Night",
  evening: "Go Do Something",
  "late-night": "There's Still Time",
};

export default function SeasonalTagline() {
  const { subtitle, cta } = useMemo(() => {
    const season = getCurrentSeason();
    const tod = getTimeOfDay();
    const options = SEASON_SUBTITLES[season];
    // Pick a consistent one per day so it doesn't flicker
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return {
      subtitle: options[dayOfYear % options.length],
      cta: TIME_CTA[tod],
    };
  }, []);

  return { subtitle, cta };
}

// Export the values as a hook for use in client components
export function useSeasonalContent() {
  return useMemo(() => {
    const season = getCurrentSeason();
    const tod = getTimeOfDay();
    const options = SEASON_SUBTITLES[season];
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return {
      subtitle: options[dayOfYear % options.length],
      cta: TIME_CTA[tod],
      season,
      timeOfDay: tod,
    };
  }, []);
}
