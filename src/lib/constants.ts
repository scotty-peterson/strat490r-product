import { TimeRange, BudgetTier, Mood, Setting } from "./types";

export const TIME_OPTIONS: { value: TimeRange; label: string; icon: string }[] =
  [
    { value: "30", label: "30 min", icon: "⚡" },
    { value: "60", label: "1 hour", icon: "⏰" },
    { value: "120", label: "2 hours", icon: "🌙" },
    { value: "180+", label: "All night", icon: "✨" },
  ];

export const BUDGET_OPTIONS: {
  value: BudgetTier;
  label: string;
  icon: string;
}[] = [
  { value: "free", label: "Free", icon: "🆓" },
  { value: "under10", label: "Under $10", icon: "💵" },
  { value: "under25", label: "Under $25", icon: "💰" },
  { value: "splurge", label: "Go all out", icon: "💎" },
];

export const MOOD_OPTIONS: { value: Mood; label: string; icon: string }[] = [
  { value: "chill", label: "Chill", icon: "😌" },
  { value: "adventurous", label: "Adventurous", icon: "🧭" },
  { value: "romantic", label: "Romantic", icon: "💕" },
  { value: "social", label: "Social", icon: "👥" },
  { value: "creative", label: "Creative", icon: "🎨" },
  { value: "active", label: "Active", icon: "🏃" },
];

export const SETTING_OPTIONS: {
  value: Setting | "no-preference";
  label: string;
  icon: string;
}[] = [
  { value: "indoor", label: "Indoor", icon: "🏠" },
  { value: "outdoor", label: "Outdoor", icon: "🌲" },
  { value: "no-preference", label: "No preference", icon: "🤷" },
];
