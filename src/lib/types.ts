export type TimeRange = "30" | "60" | "120" | "180+";

export type BudgetTier = "free" | "under10" | "under25" | "splurge";

export type Mood =
  | "chill"
  | "adventurous"
  | "romantic"
  | "social"
  | "creative"
  | "active";

export type Setting = "indoor" | "outdoor" | "either";

export type Category =
  | "food-drink"
  | "outdoors-nature"
  | "arts-culture"
  | "entertainment"
  | "active-sports"
  | "creative-diy"
  | "relaxation"
  | "social"
  | "learning"
  | "seasonal";

export interface DateIdea {
  id: string;
  title: string;
  description: string;
  estimatedTimeMinutes: number;
  timeRange: TimeRange;
  estimatedCostDollars: number;
  budgetTier: BudgetTier;
  moods: Mood[];
  setting: Setting;
  category: Category;
  tags: string[];
  lateNightFriendly: boolean;
  specificLocation?: string;
  address?: string;
  proTip?: string;
  seasonalAvailability?: string[];
}

export interface ConciergeFilters {
  timeRange: TimeRange;
  budgetTier: BudgetTier;
  moods: Mood[];
  setting: Setting | "no-preference";
}
