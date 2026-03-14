import { TimeRange, BudgetTier, Mood, Setting } from "./types";

export const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "30", label: "30 min" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
  { value: "180+", label: "All night" },
];

export const BUDGET_OPTIONS: { value: BudgetTier; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "under10", label: "Under $10" },
  { value: "under25", label: "Under $25" },
  { value: "splurge", label: "Go all out" },
];

export const MOOD_OPTIONS: { value: Mood; label: string }[] = [
  { value: "chill", label: "Chill" },
  { value: "adventurous", label: "Adventurous" },
  { value: "romantic", label: "Romantic" },
  { value: "social", label: "Social" },
  { value: "creative", label: "Creative" },
  { value: "active", label: "Active" },
];

export const SETTING_OPTIONS: {
  value: Setting | "no-preference";
  label: string;
}[] = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "no-preference", label: "No preference" },
];

export function getSuggestedTimeRange(): TimeRange {
  const hour = new Date().getHours();
  if (hour < 20) return "120";
  if (hour < 21) return "60";
  return "30";
}
