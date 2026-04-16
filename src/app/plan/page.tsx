"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";

const allIdeas = dateIdeas as DateIdea[];

const ORDER_LABELS = ["First", "Then", "Finally"];

function formatCost(dollars: number): string {
  if (dollars === 0) return "Free";
  return `$${dollars}`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildShareText(selected: DateIdea[]): string {
  const lines = [
    "Date Night Plan - Rendition",
    formatDate(),
    "",
    ...selected.map(
      (idea, i) =>
        `${ORDER_LABELS[i]}: ${idea.title} (~${formatTime(idea.estimatedTimeMinutes)}, ${formatCost(idea.estimatedCostDollars)})`
    ),
    "",
    `Total: ${formatCost(selected.reduce((s, i) => s + i.estimatedCostDollars, 0))} | ${formatTime(selected.reduce((s, i) => s + i.estimatedTimeMinutes, 0))}`,
  ];
  return lines.join("\n");
}

export default function PlanPage() {
  const [selected, setSelected] = useState<DateIdea[]>([]);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredIdeas = useMemo(() => {
    if (!search.trim()) return allIdeas;
    const q = search.toLowerCase();
    return allIdeas.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q)) ||
        i.category.toLowerCase().includes(q)
    );
  }, [search]);

  const selectedIds = new Set(selected.map((s) => s.id));

  const totalCost = selected.reduce((s, i) => s + i.estimatedCostDollars, 0);
  const totalTime = selected.reduce((s, i) => s + i.estimatedTimeMinutes, 0);

  function addIdea(idea: DateIdea) {
    if (selected.length >= 3 || selectedIds.has(idea.id)) return;
    setSelected((prev) => [...prev, idea]);
  }

  function removeIdea(id: string) {
    setSelected((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleShare() {
    const text = buildShareText(selected);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Date Night Plan", text });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildShareText(selected));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-16">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-xl hover:bg-bg-secondary transition-colors"
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
            <h1 className="text-lg font-bold text-text-primary">
              Date Plan Builder
            </h1>
            <p className="text-xs text-text-muted">
              Pick up to 3 activities for your perfect night
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {/* Selected Plan */}
        <AnimatePresence mode="popLayout">
          {selected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  Your Plan
                </h2>
                <span className="text-xs text-text-muted">
                  {selected.length}/3 activities
                </span>
              </div>

              <Reorder.Group
                axis="y"
                values={selected}
                onReorder={setSelected}
                className="space-y-2"
              >
                <AnimatePresence mode="popLayout">
                  {selected.map((idea, index) => (
                    <Reorder.Item
                      key={idea.id}
                      value={idea}
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -100 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="bg-bg-card border border-border rounded-2xl p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-accent-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          <span className="text-accent-secondary font-semibold">
                            {ORDER_LABELS[index]}:
                          </span>{" "}
                          {idea.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatCost(idea.estimatedCostDollars)} &middot;{" "}
                          {formatTime(idea.estimatedTimeMinutes)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeIdea(idea.id)}
                        className="p-1.5 rounded-lg hover:bg-bg-secondary transition-colors shrink-0"
                      >
                        <svg
                          className="w-4 h-4 text-text-muted"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>

              {/* Totals */}
              <motion.div
                layout
                className="flex items-center justify-between bg-bg-secondary rounded-xl px-4 py-2.5"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">
                      {formatCost(totalCost)}
                    </span>{" "}
                    total
                  </span>
                  <span className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">
                      {formatTime(totalTime)}
                    </span>{" "}
                    total
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {selected.map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-accent-primary"
                    />
                  ))}
                  {Array.from({ length: 3 - selected.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="w-2 h-2 rounded-full bg-border"
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plan Card Preview */}
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="space-y-3"
            >
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Plan Preview
              </h2>

              {/* The shareable card */}
              <div className="rounded-3xl overflow-hidden shadow-xl">
                <div
                  className="p-6 space-y-5"
                  style={{
                    background:
                      "linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)",
                  }}
                >
                  {/* Card header */}
                  <div className="text-center space-y-1">
                    <p className="text-white/50 text-xs font-medium uppercase tracking-[0.2em]">
                      Rendition
                    </p>
                    <h3 className="text-white text-xl font-bold">
                      Date Night Plan
                    </h3>
                    <p className="text-white/60 text-sm">{formatDate()}</p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/15" />
                    <svg
                      className="w-4 h-4 text-white/30"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <div className="flex-1 h-px bg-white/15" />
                  </div>

                  {/* Activities */}
                  <div className="space-y-3">
                    {selected.map((idea, i) => (
                      <div key={idea.id} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white/80 text-xs font-bold">
                            {i + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm">
                            {ORDER_LABELS[i]}: {idea.title}
                          </p>
                          <p className="text-white/50 text-xs mt-0.5">
                            {formatCost(idea.estimatedCostDollars)} &middot;{" "}
                            {formatTime(idea.estimatedTimeMinutes)}
                            {idea.specificLocation && (
                              <span> &middot; {idea.specificLocation}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary bar */}
                  <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-white/50 text-[10px] uppercase tracking-wider">
                        Total Cost
                      </p>
                      <p className="text-white font-bold text-lg">
                        {formatCost(totalCost)}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/15" />
                    <div className="text-center flex-1">
                      <p className="text-white/50 text-[10px] uppercase tracking-wider">
                        Total Time
                      </p>
                      <p className="text-white font-bold text-lg">
                        {formatTime(totalTime)}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/15" />
                    <div className="text-center flex-1">
                      <p className="text-white/50 text-[10px] uppercase tracking-wider">
                        Activities
                      </p>
                      <p className="text-white font-bold text-lg">
                        {selected.length}
                      </p>
                    </div>
                  </div>

                  {/* Branding footer */}
                  <p className="text-center text-white/25 text-[10px] tracking-widest uppercase">
                    Built with Rendition
                  </p>
                </div>
              </div>

              {/* Share buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleShare}
                  className="flex-1 bg-accent-primary text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm"
                >
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
                      d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                    />
                  </svg>
                  Share Plan
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCopy}
                  className="flex-1 bg-bg-card border border-border text-text-primary font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm"
                >
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
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                  </svg>
                  {copied ? "Copied!" : "Copy"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search / Filter */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            {selected.length >= 3 ? "Plan Full" : "Add Activities"}
          </h2>

          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search date ideas..."
              className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-hover transition-colors"
            />
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="space-y-2">
          {filteredIdeas.slice(0, 20).map((idea) => {
            const isSelected = selectedIds.has(idea.id);
            const isFull = selected.length >= 3;

            return (
              <motion.button
                key={idea.id}
                layout
                whileTap={!isSelected && !isFull ? { scale: 0.98 } : undefined}
                onClick={() => (isSelected ? removeIdea(idea.id) : addIdea(idea))}
                disabled={isFull && !isSelected}
                className={`w-full text-left rounded-2xl border p-3.5 flex items-center gap-3 transition-colors ${
                  isSelected
                    ? "bg-accent-primary/10 border-accent-primary/30"
                    : isFull
                      ? "bg-bg-card border-border opacity-40 cursor-not-allowed"
                      : "bg-bg-card border-border hover:border-border-hover"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-accent-primary text-white"
                      : "bg-bg-secondary text-text-muted"
                  }`}
                >
                  {isSelected ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {idea.title}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {formatCost(idea.estimatedCostDollars)} &middot;{" "}
                    {formatTime(idea.estimatedTimeMinutes)} &middot;{" "}
                    {idea.setting}
                  </p>
                </div>
                {isSelected && (
                  <span className="text-xs font-semibold text-accent-primary shrink-0">
                    #{selected.findIndex((s) => s.id === idea.id) + 1}
                  </span>
                )}
              </motion.button>
            );
          })}

          {filteredIdeas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-muted text-sm">
                No ideas match your search.
              </p>
            </div>
          )}

          {filteredIdeas.length > 20 && (
            <p className="text-center text-xs text-text-muted py-2">
              Showing 20 of {filteredIdeas.length} results. Refine your search
              to see more.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
