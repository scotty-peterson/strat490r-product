"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea, Mood } from "@/lib/types";
import { getCurrentSeason } from "@/lib/constants";

const allIdeas = dateIdeas as DateIdea[];

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    label: string;
    emoji: string;
    value: string;
  }[];
}

const QUIZ: QuizQuestion[] = [
  {
    id: "energy",
    question: "What's your energy level tonight?",
    options: [
      { label: "Barely awake", emoji: "😴", value: "low" },
      { label: "Chill vibes", emoji: "☕", value: "medium" },
      { label: "Let's gooo", emoji: "⚡", value: "high" },
    ],
  },
  {
    id: "hunger",
    question: "How hungry are you both?",
    options: [
      { label: "Not really", emoji: "🙅", value: "none" },
      { label: "Could snack", emoji: "🍿", value: "snack" },
      { label: "Starving", emoji: "🍽️", value: "hungry" },
    ],
  },
  {
    id: "spend",
    question: "What's the budget feeling?",
    options: [
      { label: "Free please", emoji: "🆓", value: "free" },
      { label: "Keep it light", emoji: "💵", value: "cheap" },
      { label: "Treat ourselves", emoji: "💳", value: "splurge" },
    ],
  },
  {
    id: "weather",
    question: "Indoor or outdoor?",
    options: [
      { label: "Inside please", emoji: "🏠", value: "indoor" },
      { label: "Don't care", emoji: "🤷", value: "either" },
      { label: "Get us outside", emoji: "🌲", value: "outdoor" },
    ],
  },
  {
    id: "talk",
    question: "How chatty are you feeling?",
    options: [
      { label: "Side by side", emoji: "🎬", value: "quiet" },
      { label: "Some talking", emoji: "💬", value: "moderate" },
      { label: "Deep convos", emoji: "❤️", value: "talkative" },
    ],
  },
  {
    id: "adventure",
    question: "Try something new or play it safe?",
    options: [
      { label: "Classic & cozy", emoji: "🛋️", value: "safe" },
      { label: "Bit of both", emoji: "🎲", value: "balanced" },
      { label: "Surprise us", emoji: "🗺️", value: "adventurous" },
    ],
  },
];

function scoreIdea(idea: DateIdea, answers: Record<string, string>): number {
  let score = 0;

  // Energy level
  const energy = answers.energy;
  if (energy === "low") {
    if (idea.moods.includes("chill")) score += 3;
    if (idea.moods.includes("active")) score -= 2;
  } else if (energy === "high") {
    if (idea.moods.includes("active") || idea.moods.includes("adventurous")) score += 3;
    if (idea.moods.includes("chill")) score -= 1;
  } else {
    score += 1; // medium matches anything
  }

  // Hunger
  const hunger = answers.hunger;
  if (hunger === "hungry" && idea.category === "food-drink") score += 4;
  if (hunger === "none" && idea.category === "food-drink") score -= 2;
  if (hunger === "snack") score += 1;

  // Budget
  const spend = answers.spend;
  if (spend === "free" && idea.estimatedCostDollars === 0) score += 4;
  if (spend === "free" && idea.estimatedCostDollars > 10) score -= 3;
  if (spend === "cheap" && idea.estimatedCostDollars <= 15) score += 2;
  if (spend === "splurge" && idea.budgetTier === "splurge") score += 3;

  // Setting
  const weather = answers.weather;
  if (weather === "indoor" && (idea.setting === "indoor" || idea.setting === "either")) score += 2;
  if (weather === "indoor" && idea.setting === "outdoor") score -= 3;
  if (weather === "outdoor" && (idea.setting === "outdoor" || idea.setting === "either")) score += 2;
  if (weather === "outdoor" && idea.setting === "indoor") score -= 3;
  if (weather === "either") score += 1;

  // Talk level
  const talk = answers.talk;
  if (talk === "quiet" && (idea.category === "entertainment" || idea.category === "arts-culture")) score += 2;
  if (talk === "talkative" && idea.moods.includes("romantic")) score += 2;
  if (talk === "talkative" && idea.moods.includes("social")) score += 2;

  // Adventure
  const adventure = answers.adventure;
  if (adventure === "adventurous" && idea.moods.includes("adventurous")) score += 3;
  if (adventure === "safe" && idea.moods.includes("chill")) score += 2;
  if (adventure === "safe" && idea.moods.includes("adventurous")) score -= 1;

  return score;
}

function getMatchLabel(score: number, maxScore: number): { label: string; color: string } {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct >= 0.8) return { label: "Perfect Match", color: "text-green-500" };
  if (pct >= 0.6) return { label: "Great Fit", color: "text-emerald-500" };
  if (pct >= 0.4) return { label: "Good Option", color: "text-amber-500" };
  return { label: "Worth a Try", color: "text-text-muted" };
}

function getImageUrl(ideaId: string): string {
  const hash = ideaId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${hash}/400/250`;
}

export default function QuizPage() {
  const router = useRouter();
  const season = useMemo(() => getCurrentSeason(), []);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = useCallback(
    (value: string) => {
      const question = QUIZ[step];
      const newAnswers = { ...answers, [question.id]: value };
      setAnswers(newAnswers);

      if (step >= QUIZ.length - 1) {
        setShowResults(true);
      } else {
        setStep((s) => s + 1);
      }
    },
    [step, answers]
  );

  const results = useMemo(() => {
    if (!showResults) return [];

    const seasonal = allIdeas.filter((i) => {
      if (i.seasonalAvailability && i.seasonalAvailability.length > 0) {
        if (!i.seasonalAvailability.includes(season)) return false;
      }
      return true;
    });

    const scored = seasonal
      .map((idea) => ({ idea, score: scoreIdea(idea, answers) }))
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 5);
  }, [showResults, answers, season]);

  const maxScore = results.length > 0 ? results[0].score : 1;

  const handleRestart = useCallback(() => {
    setStep(0);
    setAnswers({});
    setShowResults(false);
  }, []);

  const currentQuestion = QUIZ[step];

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
          Date Night Quiz
        </p>
        <div className="w-10" />
      </div>

      {/* Progress */}
      {!showResults && (
        <div className="px-6 md:max-w-lg md:mx-auto md:w-full">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-primary rounded-full"
              animate={{ width: `${((step + 1) / QUIZ.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-[11px] text-text-muted mt-1.5 text-right">
            {step + 1} of {QUIZ.length}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-8 md:max-w-lg md:mx-auto md:w-full">
        <AnimatePresence mode="wait">
          {showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto mb-3"
                >
                  <span className="text-3xl">🎯</span>
                </motion.div>
                <h2 className="text-xl font-extrabold text-text-primary mb-1">
                  Your perfect dates
                </h2>
                <p className="text-sm text-text-muted">
                  Based on tonight&apos;s vibe
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {results.map(({ idea, score }, i) => {
                  const match = getMatchLabel(score, maxScore);
                  return (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => router.push(`/idea/${idea.id}`)}
                      className="bg-bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-border-hover transition-all active:scale-[0.98]"
                    >
                      <div className="flex gap-3 p-3">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={getImageUrl(idea.id)}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${match.color}`}>
                              {i === 0 ? "🏆 " : ""}{match.label}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2 mb-1">
                            {idea.title}
                          </h3>
                          <p className="text-[11px] text-text-muted">
                            {idea.estimatedCostDollars === 0
                              ? "Free"
                              : `$${idea.estimatedCostDollars}`}{" "}
                            · {idea.estimatedTimeMinutes < 60
                              ? `${idea.estimatedTimeMinutes}m`
                              : `${Math.floor(idea.estimatedTimeMinutes / 60)}h`}
                            {idea.specificLocation && ` · ${idea.specificLocation}`}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-text-muted flex-shrink-0 self-center" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => router.push(`/idea/${results[0].idea.id}`)}
                  className="flex-1 py-3.5 bg-accent-primary text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Let&apos;s do #1
                </button>
                <button
                  onClick={handleRestart}
                  className="py-3.5 px-5 bg-bg-card border-2 border-border text-text-secondary font-semibold rounded-2xl transition-all hover:border-accent-primary active:scale-[0.98]"
                >
                  Retake
                </button>
              </div>
            </motion.div>
          ) : currentQuestion ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <h2 className="text-2xl font-extrabold text-text-primary text-center mb-8">
                {currentQuestion.question}
              </h2>

              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    className="group w-full py-5 px-5 bg-bg-card border-2 border-border rounded-2xl text-left transition-all duration-200 hover:border-accent-primary hover:scale-[1.01] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                        {opt.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
