"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";

const allIdeas = dateIdeas as DateIdea[];

type NeighborhoodKey =
  | "campus"
  | "downtown"
  | "stateSt"
  | "canyon"
  | "orem"
  | "greaterProvo";

const NEIGHBORHOOD_CONFIG: Record<
  NeighborhoodKey,
  { label: string; gradient: string; icon: string }
> = {
  campus: {
    label: "Campus & University",
    gradient: "from-blue-500 to-indigo-600",
    icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222",
  },
  downtown: {
    label: "Downtown Center Street",
    gradient: "from-amber-500 to-orange-600",
    icon: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.999 2.999 0 013.75.616 2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3 3 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016",
  },
  stateSt: {
    label: "State Street Corridor",
    gradient: "from-emerald-500 to-teal-600",
    icon: "M9 6.75V15m0-9l3-3m-3 3L6 3.75M9 15l3 3m-3-3l-3 3m12-10.5V15m0-9l3-3m-3 3l-3-3m3 12l3 3m-3-3l-3 3",
  },
  canyon: {
    label: "Provo Canyon",
    gradient: "from-green-500 to-emerald-600",
    icon: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
  },
  orem: {
    label: "Orem",
    gradient: "from-purple-500 to-violet-600",
    icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  },
  greaterProvo: {
    label: "Greater Provo",
    gradient: "from-rose-500 to-pink-600",
    icon: "M9 6.75V15m0-9l3-3m-3 3L6 3.75M9 15l3 3m-3-3l-3 3",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "food-drink": "bg-amber-400",
  "outdoors-nature": "bg-green-400",
  "arts-culture": "bg-purple-400",
  entertainment: "bg-pink-400",
  "active-sports": "bg-red-400",
  "creative-diy": "bg-indigo-400",
  relaxation: "bg-sky-400",
  social: "bg-orange-400",
  learning: "bg-teal-400",
  seasonal: "bg-yellow-400",
};

function classifyNeighborhood(address: string): NeighborhoodKey {
  const lower = address.toLowerCase();
  if (lower.includes("canyon") || lower.includes("provo canyon"))
    return "canyon";
  if (lower.includes("orem")) return "orem";
  if (
    lower.includes("center st") ||
    lower.includes("center street") ||
    lower.includes("w center") ||
    lower.includes("e center")
  )
    return "downtown";
  if (lower.includes("university ave") || lower.includes("byu"))
    return "campus";
  if (lower.includes("state st") || lower.includes("state street"))
    return "stateSt";
  return "greaterProvo";
}

interface LocationGroup {
  location: string;
  address: string;
  ideas: DateIdea[];
  categories: string[];
  minCost: number;
  maxCost: number;
}

interface NeighborhoodGroup {
  key: NeighborhoodKey;
  config: (typeof NEIGHBORHOOD_CONFIG)[NeighborhoodKey];
  locations: LocationGroup[];
  totalIdeas: number;
}

export default function MapPage() {
  const router = useRouter();
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);

  const locationIdeas = useMemo(
    () =>
      allIdeas.filter(
        (idea) => idea.specificLocation && idea.address
      ) as (DateIdea & { specificLocation: string; address: string })[],
    []
  );

  const neighborhoods = useMemo(() => {
    const locationMap = new Map<string, LocationGroup>();

    for (const idea of locationIdeas) {
      const key = idea.specificLocation;
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          location: idea.specificLocation,
          address: idea.address,
          ideas: [],
          categories: [],
          minCost: Infinity,
          maxCost: -Infinity,
        });
      }
      const group = locationMap.get(key)!;
      group.ideas.push(idea);
      if (!group.categories.includes(idea.category)) {
        group.categories.push(idea.category);
      }
      group.minCost = Math.min(group.minCost, idea.estimatedCostDollars);
      group.maxCost = Math.max(group.maxCost, idea.estimatedCostDollars);
    }

    const neighborhoodMap = new Map<NeighborhoodKey, LocationGroup[]>();
    for (const loc of locationMap.values()) {
      const hood = classifyNeighborhood(loc.address);
      if (!neighborhoodMap.has(hood)) {
        neighborhoodMap.set(hood, []);
      }
      neighborhoodMap.get(hood)!.push(loc);
    }

    const result: NeighborhoodGroup[] = [];
    const order: NeighborhoodKey[] = [
      "campus",
      "downtown",
      "stateSt",
      "canyon",
      "orem",
      "greaterProvo",
    ];

    for (const key of order) {
      const locations = neighborhoodMap.get(key);
      if (locations && locations.length > 0) {
        result.push({
          key,
          config: NEIGHBORHOOD_CONFIG[key],
          locations: locations.sort((a, b) => b.ideas.length - a.ideas.length),
          totalIdeas: locations.reduce((sum, l) => sum + l.ideas.length, 0),
        });
      }
    }

    return result;
  }, [locationIdeas]);

  const stats = useMemo(() => {
    const uniqueLocations = new Set(
      locationIdeas.map((i) => i.specificLocation)
    ).size;
    const totalIdeas = locationIdeas.length;
    const mostPopular = neighborhoods.reduce(
      (best, n) => (n.totalIdeas > best.totalIdeas ? n : best),
      neighborhoods[0]
    );
    return { uniqueLocations, totalIdeas, mostPopular };
  }, [locationIdeas, neighborhoods]);

  function formatPrice(min: number, max: number) {
    if (min === 0 && max === 0) return "Free";
    if (min === max) return `$${min}`;
    if (min === 0) return `Free-$${max}`;
    return `$${min}-$${max}`;
  }

  return (
    <div className="min-h-[100dvh] bg-primary pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-primary/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-bg-card flex items-center justify-center border border-border hover:border-border-hover transition-colors"
          >
            <svg
              className="w-5 h-5 text-text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Date Map</h1>
            <p className="text-xs text-text-muted">Explore Provo spots</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-bg-card rounded-2xl p-3 border border-border text-center">
            <p className="text-2xl font-bold text-text-primary">
              {stats.uniqueLocations}
            </p>
            <p className="text-xs text-text-muted mt-0.5">Locations</p>
          </div>
          <div className="bg-bg-card rounded-2xl p-3 border border-border text-center">
            <p className="text-2xl font-bold text-text-primary">
              {stats.totalIdeas}
            </p>
            <p className="text-xs text-text-muted mt-0.5">Date Ideas</p>
          </div>
          <div className="bg-bg-card rounded-2xl p-3 border border-border text-center">
            <p className="text-sm font-bold text-text-primary leading-tight">
              {stats.mostPopular?.config.label.split(" ")[0]}
            </p>
            <p className="text-xs text-text-muted mt-0.5">Top Area</p>
          </div>
        </motion.div>

        {/* Neighborhoods */}
        {neighborhoods.map((neighborhood, nIdx) => (
          <motion.div
            key={neighborhood.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: nIdx * 0.08 }}
          >
            {/* Neighborhood Header */}
            <div
              className={`bg-gradient-to-r ${neighborhood.config.gradient} rounded-t-2xl px-4 py-3 flex items-center justify-between`}
            >
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 text-white/90"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={neighborhood.config.icon}
                  />
                </svg>
                <h2 className="text-sm font-bold text-white">
                  {neighborhood.config.label}
                </h2>
              </div>
              <span className="text-xs font-medium text-white/80 bg-white/20 rounded-full px-2.5 py-0.5">
                {neighborhood.locations.length} spot
                {neighborhood.locations.length !== 1 ? "s" : ""} &middot;{" "}
                {neighborhood.totalIdeas} idea
                {neighborhood.totalIdeas !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Location Cards - Horizontal Scroll */}
            <div className="bg-bg-card rounded-b-2xl border border-t-0 border-border overflow-hidden">
              <div className="flex gap-3 overflow-x-auto p-3 hide-scrollbar">
                {neighborhood.locations.map((loc) => {
                  const isExpanded = expandedLocation === loc.location;
                  return (
                    <div
                      key={loc.location}
                      className="flex-shrink-0"
                      style={{ minWidth: "180px", maxWidth: "220px" }}
                    >
                      <motion.button
                        onClick={() =>
                          setExpandedLocation(isExpanded ? null : loc.location)
                        }
                        whileTap={{ scale: 0.97 }}
                        className={`w-full text-left rounded-xl p-3 border transition-colors ${
                          isExpanded
                            ? "border-accent-primary bg-bg-secondary"
                            : "border-border hover:border-border-hover bg-primary"
                        }`}
                      >
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {loc.location}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 truncate">
                          {loc.address.split(",")[0]}
                        </p>

                        <div className="flex items-center gap-1.5 mt-2">
                          {loc.categories.slice(0, 4).map((cat) => (
                            <span
                              key={cat}
                              className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[cat] || "bg-gray-400"}`}
                            />
                          ))}
                          {loc.categories.length > 4 && (
                            <span className="text-[10px] text-text-muted">
                              +{loc.categories.length - 4}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-medium text-text-secondary">
                            {formatPrice(loc.minCost, loc.maxCost)}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {loc.ideas.length} idea
                            {loc.ideas.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </motion.button>
                    </div>
                  );
                })}
              </div>

              {/* Expanded Location Detail */}
              <AnimatePresence>
                {neighborhood.locations.map(
                  (loc) =>
                    expandedLocation === loc.location && (
                      <motion.div
                        key={`detail-${loc.location}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-text-primary">
                              Ideas at {loc.location}
                            </p>
                            <button
                              onClick={() => setExpandedLocation(null)}
                              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                            >
                              Close
                            </button>
                          </div>
                          {loc.ideas.map((idea, iIdx) => (
                            <motion.button
                              key={idea.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: iIdx * 0.04 }}
                              onClick={() => router.push(`/idea/${idea.id}`)}
                              className="w-full text-left flex items-center gap-3 rounded-xl p-2.5 bg-primary border border-border hover:border-border-hover transition-colors"
                            >
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${CATEGORY_COLORS[idea.category] || "bg-gray-400"}`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                  {idea.title}
                                </p>
                                <p className="text-xs text-text-muted">
                                  {idea.estimatedCostDollars === 0
                                    ? "Free"
                                    : `$${idea.estimatedCostDollars}`}{" "}
                                  &middot; {idea.estimatedTimeMinutes} min
                                </p>
                              </div>
                              <svg
                                className="w-4 h-4 text-text-muted flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                />
                              </svg>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}

        {/* Browse All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-2 pb-4"
        >
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent-primary hover:underline"
          >
            <span>Can&apos;t find it? Browse all ideas</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
