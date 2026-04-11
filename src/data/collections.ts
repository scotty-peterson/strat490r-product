import { DateIdea } from "@/lib/types";

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
  filter: (idea: DateIdea) => boolean;
}

export const COLLECTIONS: Collection[] = [
  {
    id: "free-dates",
    title: "Totally Free",
    subtitle: "The best dates cost nothing",
    gradient: "from-green-600 to-emerald-500",
    filter: (i) => i.estimatedCostDollars === 0,
  },
  {
    id: "quick-easy",
    title: "Under an Hour",
    subtitle: "For busy weeknights",
    gradient: "from-amber-600 to-orange-500",
    filter: (i) => i.estimatedTimeMinutes <= 60,
  },
  {
    id: "romantic",
    title: "Romantic Evenings",
    subtitle: "Set the mood",
    gradient: "from-rose-600 to-pink-500",
    filter: (i) => i.moods.includes("romantic"),
  },
  {
    id: "adventure",
    title: "Try Something New",
    subtitle: "Break out of the routine",
    gradient: "from-violet-600 to-purple-500",
    filter: (i) => i.moods.includes("adventurous"),
  },
  {
    id: "foodie",
    title: "Foodie Dates",
    subtitle: "For the food lovers",
    gradient: "from-red-600 to-orange-500",
    filter: (i) => i.category === "food-drink",
  },
  {
    id: "at-home",
    title: "At Home",
    subtitle: "Cozy nights in",
    gradient: "from-sky-600 to-blue-500",
    filter: (i) => i.setting === "indoor",
  },
  {
    id: "active",
    title: "Get Moving",
    subtitle: "Burn some energy together",
    gradient: "from-teal-600 to-cyan-500",
    filter: (i) => i.moods.includes("active") || i.category === "active-sports",
  },
  {
    id: "creative",
    title: "Make Something",
    subtitle: "Build, paint, cook, create",
    gradient: "from-fuchsia-600 to-pink-500",
    filter: (i) => i.moods.includes("creative") || i.category === "creative-diy",
  },
];

export function getCollectionIdeas(
  collection: Collection,
  allIdeas: DateIdea[],
  season?: string
): DateIdea[] {
  return allIdeas.filter((idea) => {
    if (!collection.filter(idea)) return false;
    if (season && idea.seasonalAvailability && idea.seasonalAvailability.length > 0) {
      if (!idea.seasonalAvailability.includes(season)) return false;
    }
    return true;
  });
}
