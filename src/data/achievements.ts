export interface UserStats {
  totalDates: number;
  totalSaved: number;
  uniqueCategories: Set<string>;
  uniqueLocations: Set<string>;
  averageRating: number;
  hasFreeDates: number;
  hasSplurgeDates: number;
  weekStreak: number;
  fiveStarDates: number;
  totalSpent: number;
  outdoorDates: number;
  indoorDates: number;
  creativeDates: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  check: (stats: UserStats) => boolean;
  tier: "bronze" | "silver" | "gold";
}

export const achievements: Achievement[] = [
  // --- Bronze ---
  {
    id: "first-date",
    title: "First Date",
    description: "Every great love story starts somewhere.",
    icon: "💕",
    requirement: "Complete your first date",
    check: (s) => s.totalDates >= 1,
    tier: "bronze",
  },
  {
    id: "penny-pincher",
    title: "Penny Pincher",
    description: "Proof that the best things in life are free.",
    icon: "🪙",
    requirement: "Complete 3 free dates",
    check: (s) => s.hasFreeDates >= 3,
    tier: "bronze",
  },
  {
    id: "bookmarked",
    title: "Bookmarked",
    description: "Building your date night wishlist.",
    icon: "🔖",
    requirement: "Save 5 date ideas",
    check: (s) => s.totalSaved >= 5,
    tier: "bronze",
  },
  {
    id: "outdoor-lover",
    title: "Outdoor Lover",
    description: "Fresh air and good company.",
    icon: "🌿",
    requirement: "Complete 3 outdoor dates",
    check: (s) => s.outdoorDates >= 3,
    tier: "bronze",
  },
  {
    id: "first-review",
    title: "Thoughtful Critic",
    description: "Your opinion matters!",
    icon: "📝",
    requirement: "Rate your first date 5 stars",
    check: (s) => s.fiveStarDates >= 1,
    tier: "bronze",
  },

  // --- Silver ---
  {
    id: "explorer",
    title: "Explorer",
    description: "Variety is the spice of love.",
    icon: "🧭",
    requirement: "Try 5 different categories",
    check: (s) => s.uniqueCategories.size >= 5,
    tier: "silver",
  },
  {
    id: "critic",
    title: "Date Critic",
    description: "You've got strong opinions and we respect that.",
    icon: "⭐",
    requirement: "Rate 10 dates",
    check: (s) => s.totalDates >= 10,
    tier: "silver",
  },
  {
    id: "local-guide",
    title: "Local Guide",
    description: "You know Provo like the back of your hand.",
    icon: "📍",
    requirement: "Visit 5 different locations",
    check: (s) => s.uniqueLocations.size >= 5,
    tier: "silver",
  },
  {
    id: "night-owl",
    title: "Night Owl",
    description: "The night is young and so are you.",
    icon: "🦉",
    requirement: "Complete 5 dates",
    check: (s) => s.totalDates >= 5,
    tier: "silver",
  },
  {
    id: "big-spender",
    title: "Big Spender",
    description: "Treating your date right, one splurge at a time.",
    icon: "💸",
    requirement: "Spend $100+ total on dates",
    check: (s) => s.totalSpent >= 100,
    tier: "silver",
  },
  {
    id: "creative-soul",
    title: "Creative Soul",
    description: "Making memories with your hands and heart.",
    icon: "🎨",
    requirement: "Complete 3 creative/DIY dates",
    check: (s) => s.creativeDates >= 3,
    tier: "silver",
  },

  // --- Gold ---
  {
    id: "date-master",
    title: "Date Master",
    description: "15 dates? You're officially a pro.",
    icon: "👑",
    requirement: "Complete 15 dates",
    check: (s) => s.totalDates >= 15,
    tier: "gold",
  },
  {
    id: "five-star-couple",
    title: "5-Star Couple",
    description: "Perfection is a pattern for you two.",
    icon: "🌟",
    requirement: "Rate 5 dates with 5 stars",
    check: (s) => s.fiveStarDates >= 5,
    tier: "gold",
  },
  {
    id: "streak-legend",
    title: "Streak Legend",
    description: "A month of weekly dates. Legendary commitment.",
    icon: "🔥",
    requirement: "Go on dates 4 weeks in a row",
    check: (s) => s.weekStreak >= 4,
    tier: "gold",
  },
  {
    id: "renaissance-couple",
    title: "Renaissance Couple",
    description: "You've done it all. Nothing can stop you.",
    icon: "🏛️",
    requirement: "Try 8+ different categories",
    check: (s) => s.uniqueCategories.size >= 8,
    tier: "gold",
  },
];
