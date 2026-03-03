import { DateIdea, ConciergeFilters, TimeRange, BudgetTier } from "./types";

const TIME_ORDER: TimeRange[] = ["30", "60", "120", "180+"];
const BUDGET_ORDER: BudgetTier[] = ["free", "under10", "under25", "splurge"];

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

function scoreAndFilter(
  allIdeas: DateIdea[],
  filters: ConciergeFilters,
  excludeIds: Set<string>
): ScoredIdea[] {
  const scored: ScoredIdea[] = [];

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

    let score = 0;
    const moodOverlap = idea.moods.filter((m) =>
      filters.moods.includes(m)
    ).length;
    score += moodOverlap * 10;
    if (moodOverlap === filters.moods.length) score += 5;
    score += Math.random() * 3;

    scored.push({ idea, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
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
