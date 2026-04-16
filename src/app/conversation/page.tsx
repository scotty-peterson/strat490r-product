"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Category definitions ─── */

interface Category {
  id: string;
  label: string;
  emoji: string;
  gradient: string;
}

const CATEGORIES: Category[] = [
  {
    id: "know",
    label: "Getting to Know You",
    emoji: "👋",
    gradient: "from-amber-500/80 to-orange-600/80",
  },
  {
    id: "deep",
    label: "Deep & Meaningful",
    emoji: "🌊",
    gradient: "from-indigo-500/80 to-purple-600/80",
  },
  {
    id: "fun",
    label: "Fun & Silly",
    emoji: "😂",
    gradient: "from-emerald-400/80 to-teal-500/80",
  },
  {
    id: "dream",
    label: "Dream Together",
    emoji: "✨",
    gradient: "from-pink-400/80 to-rose-500/80",
  },
  {
    id: "spicy",
    label: "Spicy 🌶️",
    emoji: "🌶️",
    gradient: "from-red-500/80 to-orange-500/80",
  },
];

/* ─── Questions ─── */

const QUESTIONS: Record<string, string[]> = {
  know: [
    "What's a hobby you've always wanted to try but haven't yet?",
    "What does your perfect Saturday morning look like?",
    "If you could live in any city for a year, where would you go?",
    "What's the best meal you've ever had and where was it?",
    "What song have you had on repeat lately?",
    "What's something you're really proud of that most people don't know about?",
    "If you could have dinner with anyone — alive or dead — who would it be?",
    "What's a small thing that instantly makes your day better?",
    "What were you like in high school? Would we have been friends?",
    "What's the most spontaneous thing you've ever done?",
    "What's your love language, and how do you like to receive it?",
    "If you could relive one day of your life, which would it be?",
  ],
  deep: [
    "What's a belief you held strongly that you've since changed your mind about?",
    "What does 'home' mean to you beyond just a physical place?",
    "What's the hardest lesson you've learned in a relationship?",
    "If you knew you couldn't fail, what would you do with your life?",
    "What's something you're still learning to forgive yourself for?",
    "How do you want to be remembered by the people closest to you?",
    "What's a fear you've overcome, and how did you do it?",
    "What role does faith or spirituality play in your life right now?",
    "When was the last time you felt truly at peace? What were you doing?",
    "What's a question you wish someone would ask you?",
    "What does vulnerability look like to you in a relationship?",
    "If you could send a message to your future self 10 years from now, what would you say?",
  ],
  fun: [
    "If we had to compete on a reality TV show together, which one would we dominate?",
    "What's the worst date you've ever been on? Make me feel better about mine.",
    "If you could swap lives with any fictional character for a week, who would it be?",
    "What's the most embarrassing thing you'd admit to for free ice cream from the BYU Creamery?",
    "If we were both characters in a movie, what genre would it be?",
    "What's a hill you will absolutely die on that most people think is ridiculous?",
    "If you could only eat one Provo restaurant's food for a month, which one?",
    "What's your most controversial food opinion?",
    "If you had to teach a college class on anything, what would it be?",
    "What's the weirdest talent you have that you can demonstrate right now?",
    "Would you rather have the ability to fly or be invisible, and what would you do first?",
    "If we got stranded in the Utah mountains overnight, what three things would you want to have?",
  ],
  dream: [
    "Where do you see yourself in five years, and what does a normal Tuesday look like?",
    "If money were no object, what kind of house would you build and where?",
    "What's a trip you've always dreamed of taking? Plan it with me right now.",
    "If we could start a business together, what would it be?",
    "What traditions do you want in your future family?",
    "What's on your bucket list that you haven't told anyone about?",
    "If you could master any skill overnight, what would it be and why?",
    "Describe your dream weekend getaway — no budget, no limits.",
    "What kind of impact do you want to make on the world?",
    "If we could volunteer anywhere in the world together, where would we go?",
    "What's a goal you're working toward right now that excites you?",
    "If you could guarantee one thing about your future, what would it be?",
  ],
  spicy: [
    "What's the most attractive quality someone can have that isn't physical?",
    "When did you first realize you were interested in me, and what gave it away?",
    "What's something I do that you find unexpectedly attractive?",
    "What's your idea of the perfect kiss?",
    "Have you ever had a dream about us? What happened?",
    "What's the most romantic thing someone has ever done for you?",
    "If you could plan the perfect date night with no restrictions, what would we do?",
    "What's a compliment you've received that you still think about?",
    "What's something you've never told a date before but want to tell me?",
    "What does romance mean to you — grand gestures or small daily moments?",
    "What's a relationship deal-breaker that might surprise people?",
    "If we were in a rom-com, what would our meet-cute have been?",
  ],
};

/* ─── Shuffle helper ─── */

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/* ─── Page component ─── */

export default function ConversationPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("know");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [copied, setCopied] = useState(false);

  // Memoize shuffled questions per category — reshuffled on demand
  const [shuffledQuestions, setShuffledQuestions] = useState<
    Record<string, string[]>
  >(() => {
    const result: Record<string, string[]> = {};
    for (const key of Object.keys(QUESTIONS)) {
      result[key] = shuffleArray(QUESTIONS[key]);
    }
    return result;
  });

  const questions = shuffledQuestions[activeCategoryId];
  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId)!;
  const currentQuestion = questions[currentIndex];

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) =>
      prev >= questions.length - 1 ? 0 : prev + 1
    );
  }, [questions.length]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev <= 0 ? questions.length - 1 : prev - 1
    );
  }, [questions.length]);

  const handleCategoryChange = useCallback((id: string) => {
    setActiveCategoryId(id);
    setCurrentIndex(0);
    setDirection(0);
  }, []);

  const handleShuffle = useCallback(() => {
    const newShuffled = shuffleArray(QUESTIONS[activeCategoryId]);
    setShuffledQuestions((prev) => ({ ...prev, [activeCategoryId]: newShuffled }));
    setCurrentIndex(0);
    setDirection(1);
  }, [activeCategoryId]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentQuestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — noop
    }
  }, [currentQuestion]);

  /* Card animation variants */
  const cardVariants = {
    enter: (dir: number) => ({
      x: dir === 0 ? 0 : dir > 0 ? 260 : -260,
      opacity: 0,
      scale: 0.92,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -260 : 260,
      opacity: 0,
      scale: 0.92,
    }),
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-4 pb-2 md:max-w-lg md:mx-auto md:w-full">
        <Link
          href="/"
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <p className="text-xs font-semibold text-text-muted tracking-wide uppercase">
          Conversation Starters
        </p>
        <div className="w-10" />
      </div>

      {/* Category pills — horizontally scrollable */}
      <div className="px-4 md:max-w-lg md:mx-auto md:w-full mt-2">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategoryId === cat.id
                  ? "bg-accent-primary text-white shadow-sm"
                  : "bg-bg-secondary text-text-secondary hover:bg-bg-card"
              }`}
            >
              {cat.emoji}{" "}
              <span className="ml-1">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Question counter */}
      <div className="px-6 mt-3 md:max-w-lg md:mx-auto md:w-full flex items-center justify-between">
        <p className="text-xs text-text-muted">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-primary transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Shuffle
        </button>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-6 py-6 md:max-w-lg md:mx-auto md:w-full">
        <div className="relative w-full" style={{ minHeight: 320 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${activeCategoryId}-${currentIndex}`}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={goToNext}
              className={`absolute inset-0 cursor-pointer rounded-3xl bg-gradient-to-br ${activeCategory.gradient} p-6 flex flex-col justify-between shadow-lg`}
              style={{ minHeight: 320 }}
            >
              {/* Top — category badge */}
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                  {activeCategory.emoji} {activeCategory.label}
                </span>
              </div>

              {/* Center — question */}
              <p className="text-white text-xl md:text-2xl font-semibold leading-snug text-center px-2">
                {currentQuestion}
              </p>

              {/* Bottom — hint */}
              <p className="text-white/50 text-[11px] text-center">
                Tap card for next question
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-6 mb-16 md:max-w-lg md:mx-auto md:w-full flex flex-col gap-3">
        {/* Prev / Next buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrev}
            className="flex-1 py-3 rounded-2xl bg-bg-secondary text-text-secondary text-sm font-medium hover:bg-bg-card transition-colors"
          >
            Previous
          </button>
          <button
            onClick={goToNext}
            className="flex-1 py-3 rounded-2xl bg-accent-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Next
          </button>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="w-full py-2.5 rounded-2xl border border-border text-text-secondary text-sm font-medium hover:border-border-hover hover:text-text-primary transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <svg
                className="w-4 h-4 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share Question
            </>
          )}
        </button>
      </div>
    </div>
  );
}
