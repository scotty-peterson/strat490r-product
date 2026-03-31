import { DateIdea, ConciergeFilters, TimeRange, BudgetTier } from "./types";
import { getCurrentSeason } from "./constants";

const TIME_ORDER: TimeRange[] = ["30", "60", "120", "180+"];
const BUDGET_ORDER: BudgetTier[] = ["free", "under10", "under25", "splurge"];

// Deterministic pseudo-random based on idea id — avoids hydration mismatch
function hashScore(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 300) / 100; // 0–2.99
}

function timeMatches(ideaTime: TimeRange, userTime: TimeRange): boolean {
  return TIME_ORDER.indexOf(ideaTime) <= TIME_ORDER.indexOf(userTime);
}

function budgetMatches(ideaTier: BudgetTier, userTier: BudgetTier): boolean {
  return BUDGET_ORDER.indexOf(ideaTier) <= BUDGET_ORDER.indexOf(userTier);
}

interface ScoredIdea {
  idea: DateIdea;
  score: number;
}

function seasonMatches(idea: DateIdea, season: string): boolean {
  // No seasonal tag = available year-round
  if (!idea.seasonalAvailability || idea.seasonalAvailability.length === 0) return true;
  return idea.seasonalAvailability.includes(season);
}

function scoreAndFilter(
  allIdeas: DateIdea[],
  filters: ConciergeFilters,
  excludeIds: Set<string>
): ScoredIdea[] {
  const scored: ScoredIdea[] = [];
  const season = getCurrentSeason();

  for (const idea of allIdeas) {
    if (excludeIds.has(idea.id)) continue;
    if (!timeMatches(idea.timeRange, filters.timeRange)) continue;
    if (!budgetMatches(idea.budgetTier, filters.budgetTier)) continue;

    if (
      filters.setting !== "no-preference" &&
      idea.setting !== "either" &&
      idea.setting !== filters.setting
    ) {
      continue;
    }

    // Filter out ideas that aren't in season
    if (!seasonMatches(idea, season)) continue;

    let score = 0;
    const moodOverlap = idea.moods.filter((m) =>
      filters.moods.includes(m)
    ).length;
    score += moodOverlap * 10;
    if (moodOverlap === filters.moods.length) score += 5;

    // Boost ideas that are specifically tagged for this season
    if (idea.seasonalAvailability?.includes(season)) score += 3;

    score += hashScore(idea.id);

    scored.push({ idea, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export function countMatchingIdeas(
  allIdeas: DateIdea[],
  filters: ConciergeFilters
): number {
  return scoreAndFilter(allIdeas, filters, new Set()).length;
}

export function matchIdeas(
  allIdeas: DateIdea[],
  filters: ConciergeFilters,
  excludeIds: string[] = [],
  count: number = 3
): DateIdea[] {
  const excludeSet = new Set(excludeIds);

  // Try with exact filters first
  let results = scoreAndFilter(allIdeas, filters, excludeSet);
  if (results.length >= count) {
    return results.slice(0, count).map((s) => s.idea);
  }

  // Relax setting preference
  if (filters.setting !== "no-preference") {
    const relaxed = { ...filters, setting: "no-preference" as const };
    results = scoreAndFilter(allIdeas, relaxed, excludeSet);
    if (results.length >= count) {
      return results.slice(0, count).map((s) => s.idea);
    }
  }

  // Relax time by one tier
  const timeIdx = TIME_ORDER.indexOf(filters.timeRange);
  if (timeIdx < TIME_ORDER.length - 1) {
    const relaxed = {
      ...filters,
      timeRange: TIME_ORDER[timeIdx + 1],
      setting: "no-preference" as const,
    };
    results = scoreAndFilter(allIdeas, relaxed, excludeSet);
    if (results.length >= count) {
      return results.slice(0, count).map((s) => s.idea);
    }
  }

  // Relax budget by one tier
  const budgetIdx = BUDGET_ORDER.indexOf(filters.budgetTier);
  if (budgetIdx < BUDGET_ORDER.length - 1) {
    const relaxed = {
      ...filters,
      timeRange:
        timeIdx < TIME_ORDER.length - 1
          ? TIME_ORDER[timeIdx + 1]
          : filters.timeRange,
      budgetTier: BUDGET_ORDER[budgetIdx + 1],
      setting: "no-preference" as const,
    };
    results = scoreAndFilter(allIdeas, relaxed, excludeSet);
  }

  // Return whatever we have
  return results.slice(0, count).map((s) => s.idea);
}
