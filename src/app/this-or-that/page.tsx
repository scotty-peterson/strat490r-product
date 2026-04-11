"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";
import { getCurrentSeason } from "@/lib/constants";

const allIdeas = dateIdeas as DateIdea[];

interface Round {
  question: string;
  optionA: { label: string; emoji: string; filter: (i: DateIdea) => boolean };
  optionB: { label: string; emoji: string; filter: (i: DateIdea) => boolean };
}

const ROUNDS: Round[] = [
  {
    question: "What sounds better tonight?",
    optionA: {
      label: "Stay in",
      emoji: "🏠",
      filter: (i) => i.setting === "indoor" || i.setting === "either",
    },
    optionB: {
      label: "Go out",
      emoji: "🌙",
      filter: (i) => i.setting === "outdoor" || i.setting === "either",
    },
  },
  {
    question: "What's the vibe?",
    optionA: {
      label: "Chill & cozy",
      emoji: "☕",
      filter: (i) => i.moods.includes("chill") || i.moods.includes("romantic"),
    },
    optionB: {
      label: "Fun & active",
      emoji: "⚡",
      filter: (i) => i.moods.includes("adventurous") || i.moods.includes("active") || i.moods.includes("social"),
    },
  },
  {
    question: "Budget?",
    optionA: {
      label: "Keep it cheap",
      emoji: "💰",
      filter: (i) => i.estimatedCostDollars <= 10,
    },
    optionB: {
      label: "Treat ourselves",
      emoji: "✨",
      filter: (i) => i.estimatedCostDollars > 10,
    },
  },
  {
    question: "How hungry are you?",
    optionA: {
      label: "Food is key",
      emoji: "🍕",
      filter: (i) => i.category === "food-drink",
    },
    optionB: {
      label: "Not about food",
      emoji: "🎯",
      filter: (i) => i.category !== "food-drink",
    },
  },
  {
    question: "Make something or watch something?",
    optionA: {
      label: "Create together",
      emoji: "🎨",
      filter: (i) => i.moods.includes("creative") || i.category === "creative-diy",
    },
    optionB: {
      label: "Be entertained",
      emoji: "🎬",
      filter: (i) => i.category === "entertainment" || i.category === "arts-culture",
    },
  },
];

function getImageUrl(ideaId: string): string {
  const hash = ideaId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${hash}/600/400`;
}

export default function ThisOrThatPage() {
  const router = useRouter();
  const season = useMemo(() => getCurrentSeason(), []);
  const [round, setRound] = useState(0);
  const [candidates, setCandidates] = useState<DateIdea[]>(() => {
    return allIdeas.filter((i) => {
      if (i.seasonalAvailability && i.seasonalAvailability.length > 0) {
        if (!i.seasonalAvailability.includes(season)) return false;
      }
      return true;
    });
  });
  const [result, setResult] = useState<DateIdea | null>(null);
  const [direction, setDirection] = useState(0);

  const handleChoice = useCallback(
    (filter: (i: DateIdea) => boolean) => {
      const filtered = candidates.filter(filter);
      // If filter would eliminate everything, keep current candidates
      const next = filtered.length > 0 ? filtered : candidates;

      if (round >= ROUNDS.length - 1 || next.length <= 3) {
        // Pick a winner
        const winner = next[Math.floor(Math.random() * next.length)];
        setResult(winner);
        setDirection(1);
      } else {
        setCandidates(next);
        setDirection(1);
        setRound((r) => r + 1);
      }
    },
    [candidates, round]
  );

  const handleRestart = useCallback(() => {
    setRound(0);
    setResult(null);
    setCandidates(
      allIdeas.filter((i) => {
        if (i.seasonalAvailability && i.seasonalAvailability.length > 0) {
          if (!i.seasonalAvailability.includes(season)) return false;
        }
        return true;
      })
    );
  }, [season]);

  const currentRound = ROUNDS[round];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-4 pb-2 md:max-w-lg md:mx-auto md:w-full">
        <Link
          href="/"
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <p className="text-xs font-semibold text-text-muted tracking-wide uppercase">
          This or That
        </p>
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      {!result && (
        <div className="px-6 md:max-w-lg md:mx-auto md:w-full">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((round + 1) / ROUNDS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-[11px] text-text-muted mt-1.5 text-right">
            {candidates.length} ideas left
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-8 md:max-w-lg md:mx-auto md:w-full">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full text-center"
            >
              <p className="text-xs font-semibold text-accent-primary uppercase tracking-widest mb-2">
                Your match
              </p>
              <h2 className="text-2xl font-extrabold text-text-primary mb-6">
                {result.title}
              </h2>

              <div
                onClick={() => router.push(`/idea/${result.id}`)}
                className="rounded-2xl overflow-hidden border-2 border-border cursor-pointer hover:border-accent-primary transition-all active:scale-[0.98] mb-6"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={getImageUrl(result.id)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 bg-bg-card text-left">
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                    {result.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-text-muted px-2 py-1 bg-bg-primary rounded-lg">
                      {result.estimatedCostDollars === 0 ? "Free" : `$${result.estimatedCostDollars}`}
                    </span>
                    <span className="text-xs text-text-muted px-2 py-1 bg-bg-primary rounded-lg">
                      {result.estimatedTimeMinutes < 60
                        ? `${result.estimatedTimeMinutes}m`
                        : `${Math.floor(result.estimatedTimeMinutes / 60)}h`}
                    </span>
                    {result.specificLocation && (
                      <span className="text-xs text-accent-primary px-2 py-1 bg-accent-primary/10 rounded-lg">
                        {result.specificLocation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/idea/${result.id}`)}
                  className="flex-1 py-3.5 bg-accent-primary text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Let&apos;s do it
                </button>
                <button
                  onClick={handleRestart}
                  className="py-3.5 px-5 bg-bg-card border-2 border-border text-text-secondary font-semibold rounded-2xl transition-all hover:border-accent-primary active:scale-[0.98]"
                >
                  Again
                </button>
              </div>
            </motion.div>
          ) : currentRound ? (
            <motion.div
              key={round}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <h2 className="text-2xl font-extrabold text-text-primary text-center mb-8">
                {currentRound.question}
              </h2>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleChoice(currentRound.optionA.filter)}
                  className="group w-full py-6 px-6 bg-bg-card border-2 border-border rounded-2xl text-left transition-all duration-200 hover:border-accent-primary hover:scale-[1.01] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{currentRound.optionA.emoji}</span>
                    <span className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                      {currentRound.optionA.label}
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-3 px-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs font-bold text-text-muted">OR</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <button
                  onClick={() => handleChoice(currentRound.optionB.filter)}
                  className="group w-full py-6 px-6 bg-bg-card border-2 border-border rounded-2xl text-left transition-all duration-200 hover:border-accent-secondary hover:scale-[1.01] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{currentRound.optionB.emoji}</span>
                    <span className="text-lg font-bold text-text-primary group-hover:text-accent-secondary transition-colors">
                      {currentRound.optionB.label}
                    </span>
                  </div>
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
