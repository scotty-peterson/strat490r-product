"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";
import { getCurrentSeason } from "@/lib/constants";
import { useAllDateHistory } from "@/hooks/useDateHistory";

const allIdeas = dateIdeas as DateIdea[];

const CATEGORIES = [
  { value: "all", label: "All", icon: "M4 6h16M4 12h16M4 18h16" },
  { value: "food-drink", label: "Food & Drink", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" },
  { value: "outdoors-nature", label: "Outdoors", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { value: "arts-culture", label: "Arts", icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" },
  { value: "entertainment", label: "Entertainment", icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" },
  { value: "creative-diy", label: "Creative", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" },
  { value: "active-sports", label: "Active", icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" },
  { value: "relaxation", label: "Relaxation", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" },
  { value: "learning", label: "Learning", icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" },
];

const BUDGET_FILTERS = [
  { value: "all", label: "Any price" },
  { value: "free", label: "Free" },
  { value: "under10", label: "Under $10" },
  { value: "under25", label: "Under $25" },
];

function getImageUrl(ideaId: string): string {
  const hash = ideaId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${hash}/400/300`;
}

export default function ExplorePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [budget, setBudget] = useState("all");
  const [showInSeason, setShowInSeason] = useState(false);
  const { completedIdeaIds } = useAllDateHistory();
  const season = useMemo(() => getCurrentSeason(), []);

  const filteredIdeas = useMemo(() => {
    let result = allIdeas;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          (i.specificLocation && i.specificLocation.toLowerCase().includes(q))
      );
    }

    // Category
    if (category !== "all") {
      result = result.filter((i) => i.category === category);
    }

    // Budget
    if (budget !== "all") {
      result = result.filter((i) => i.budgetTier === budget);
    }

    // In season
    if (showInSeason) {
      result = result.filter(
        (i) =>
          !i.seasonalAvailability ||
          i.seasonalAvailability.length === 0 ||
          i.seasonalAvailability.includes(season)
      );
    }

    return result;
  }, [search, category, budget, showInSeason, season]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 md:px-8 pt-4 pb-3 md:max-w-6xl md:mx-auto md:w-full">
          <Link
            href="/"
            className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-sm font-semibold text-text-secondary tracking-wide uppercase">
            Explore
          </h1>
          <div className="w-10" />
        </div>

        {/* Search */}
        <div className="px-4 md:px-8 pb-3 md:max-w-6xl md:mx-auto md:w-full">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ideas, places, tags..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-card border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-primary transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="px-4 md:px-8 pb-3 md:max-w-6xl md:mx-auto md:w-full overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border whitespace-nowrap transition-colors duration-200 ${
                  category === cat.value
                    ? "bg-accent-primary text-white border-accent-primary"
                    : "bg-bg-card border-border text-text-secondary hover:border-border-hover"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                </svg>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters */}
        <div className="px-4 md:px-8 pb-3 md:max-w-6xl md:mx-auto md:w-full flex items-center gap-2">
          <div className="flex gap-1.5">
            {BUDGET_FILTERS.map((b) => (
              <button
                key={b.value}
                onClick={() => setBudget(b.value)}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                  budget === b.value
                    ? "bg-accent-secondary/15 text-accent-secondary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <span className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => setShowInSeason((s) => !s)}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
              showInSeason
                ? "bg-green-100 text-green-700"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            In season
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="px-6 pt-4 pb-2 md:max-w-6xl md:mx-auto md:w-full">
        <p className="text-xs text-text-muted">
          {filteredIdeas.length} idea{filteredIdeas.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
          {category !== "all" && ` in ${CATEGORIES.find((c) => c.value === category)?.label}`}
        </p>
      </div>

      {/* Grid */}
      <div className="px-4 md:px-8 pb-8 md:max-w-6xl md:mx-auto md:w-full">
        <AnimatePresence mode="popLayout">
          {filteredIdeas.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
            >
              {filteredIdeas.map((idea, i) => (
                <motion.div
                  key={idea.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => router.push(`/idea/${idea.id}`)}
                  className="bg-bg-card rounded-xl border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:border-border-hover hover:shadow-sm active:scale-[0.97]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getImageUrl(idea.id)}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {completedIdeaIds.has(idea.id) && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                    {idea.estimatedCostDollars === 0 && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-accent-primary">
                        FREE
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2 mb-1">
                      {idea.title}
                    </h3>
                    <p className="text-[11px] text-text-muted">
                      {idea.estimatedCostDollars === 0
                        ? "Free"
                        : `$${idea.estimatedCostDollars}`}{" "}
                      &middot;{" "}
                      {idea.estimatedTimeMinutes < 60
                        ? `${idea.estimatedTimeMinutes}m`
                        : `${Math.floor(idea.estimatedTimeMinutes / 60)}h${idea.estimatedTimeMinutes % 60 ? ` ${idea.estimatedTimeMinutes % 60}m` : ""}`}
                      {idea.specificLocation && (
                        <>
                          {" "}&middot;{" "}
                          <span className="text-accent-primary">{idea.specificLocation}</span>
                        </>
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-bg-card border border-border flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-text-secondary font-semibold mb-1">No ideas found</p>
              <p className="text-sm text-text-muted">Try adjusting your filters</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setBudget("all");
                  setShowInSeason(false);
                }}
                className="mt-4 text-sm text-accent-primary font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
