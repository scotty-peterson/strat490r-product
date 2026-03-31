import { TimeRange, BudgetTier, Mood, Setting } from "./types";

export const TIME_OPTIONS: { value: TimeRange; label: string; subtitle: string }[] = [
  { value: "30", label: "30 min", subtitle: "Quick and spontaneous" },
  { value: "60", label: "1 hour", subtitle: "Just right for a weeknight" },
  { value: "120", label: "2 hours", subtitle: "A proper evening out" },
  { value: "180+", label: "All night", subtitle: "No rush, no limits" },
];

export const BUDGET_OPTIONS: { value: BudgetTier; label: string; subtitle: string }[] = [
  { value: "free", label: "Free", subtitle: "The best things cost nothing" },
  { value: "under10", label: "Under $10", subtitle: "Low-key and casual" },
  { value: "under25", label: "Under $25", subtitle: "A solid date night" },
  { value: "splurge", label: "Go all out", subtitle: "Treat yourselves" },
];

export const MOOD_OPTIONS: { value: Mood; label: string; subtitle: string }[] = [
  { value: "chill", label: "Chill", subtitle: "Low-key and relaxed" },
  { value: "adventurous", label: "Adventurous", subtitle: "Try something new" },
  { value: "romantic", label: "Romantic", subtitle: "Set the mood" },
  { value: "social", label: "Social", subtitle: "Get out and mingle" },
  { value: "creative", label: "Creative", subtitle: "Make something together" },
  { value: "active", label: "Active", subtitle: "Get moving" },
];

export const SETTING_OPTIONS: {
  value: Setting | "no-preference";
  label: string;
  subtitle: string;
}[] = [
  { value: "indoor", label: "Indoor", subtitle: "Cozy and comfortable" },
  { value: "outdoor", label: "Outdoor", subtitle: "Fresh air and open sky" },
  { value: "no-preference", label: "No preference", subtitle: "Surprise us" },
];

export function getSuggestedTimeRange(): TimeRange {
  const hour = new Date().getHours();
  if (hour < 20) return "120";
  if (hour < 21) return "60";
  return "30";
}

export type Season = "spring" | "summer" | "fall" | "winter";

export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-indexed
  if (month >= 2 && month <= 4) return "spring";   // Mar-May
  if (month >= 5 && month <= 7) return "summer";    // Jun-Aug
  if (month >= 8 && month <= 10) return "fall";     // Sep-Nov
  return "winter";                                   // Dec-Feb
}

export function getTimeOfDay(): "morning" | "afternoon" | "evening" | "late-night" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "late-night";
}

export function getSeasonLabel(season: Season): string {
  return season.charAt(0).toUpperCase() + season.slice(1);
}

export function getTimeOfDayLabel(tod: ReturnType<typeof getTimeOfDay>): string {
  switch (tod) {
    case "morning": return "morning";
    case "afternoon": return "afternoon";
    case "evening": return "evening";
    case "late-night": return "late night";
  }
}
