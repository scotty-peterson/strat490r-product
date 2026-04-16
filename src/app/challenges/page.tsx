"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ─── */

type Difficulty = "easy" | "medium" | "bold";

interface Challenge {
  id: number;
  text: string;
  emoji: string;
  difficulty: Difficulty;
  time: string;
}

/* ─── Challenge Data ─── */

const CHALLENGES: Challenge[] = [
  // ── Easy (green) ──
  { id: 1, text: "Order each other's food without asking what they want", emoji: "🍽️", difficulty: "easy", time: "5 min" },
  { id: 2, text: "Take a selfie recreating each other's most-used emoji", emoji: "🤳", difficulty: "easy", time: "3 min" },
  { id: 3, text: "Share your most embarrassing childhood photo from your camera roll", emoji: "📸", difficulty: "easy", time: "2 min" },
  { id: 4, text: "Give each other a new nickname that you have to use for the rest of the date", emoji: "🏷️", difficulty: "easy", time: "1 min" },
  { id: 5, text: "Each person tells a joke — whoever laughs first loses", emoji: "😂", difficulty: "easy", time: "5 min" },
  { id: 6, text: "Swap phones and send a text to each other's best friend", emoji: "📱", difficulty: "easy", time: "3 min" },
  { id: 7, text: "Draw a portrait of each other without looking at the paper", emoji: "🎨", difficulty: "easy", time: "5 min" },
  { id: 8, text: "Play rock-paper-scissors — loser has to compliment a stranger", emoji: "✊", difficulty: "easy", time: "3 min" },
  { id: 9, text: "Take a photo that could be a movie poster and caption it", emoji: "🎬", difficulty: "easy", time: "5 min" },
  { id: 10, text: "Each person shares something on their bucket list the other doesn't know", emoji: "📝", difficulty: "easy", time: "5 min" },
  { id: 11, text: "Try to make each other laugh using only facial expressions — no words", emoji: "🤪", difficulty: "easy", time: "3 min" },
  { id: 12, text: "Share the last thing you searched on Google", emoji: "🔍", difficulty: "easy", time: "2 min" },
  { id: 13, text: "Do your best impression of how you think the other person texts", emoji: "💬", difficulty: "easy", time: "3 min" },
  { id: 14, text: "Name 5 things you love about the other person in 30 seconds", emoji: "💛", difficulty: "easy", time: "1 min" },
  { id: 15, text: "Take a photo recreating a famous meme together", emoji: "🖼️", difficulty: "easy", time: "5 min" },
  { id: 16, text: "Tell the story of your most awkward first impression of someone", emoji: "😅", difficulty: "easy", time: "3 min" },

  // ── Medium (amber) ──
  { id: 17, text: "Ask a stranger to take a candid photo of you two — no posing allowed", emoji: "📷", difficulty: "medium", time: "5 min" },
  { id: 18, text: "Teach each other a skill in 5 minutes and demo it", emoji: "🎓", difficulty: "medium", time: "10 min" },
  { id: 19, text: "Go to a store and pick out an outfit for each other under $10", emoji: "👗", difficulty: "medium", time: "15 min" },
  { id: 20, text: "Write and perform a 30-second jingle about your relationship", emoji: "🎵", difficulty: "medium", time: "10 min" },
  { id: 21, text: "Call a family member and introduce your date in a funny accent", emoji: "📞", difficulty: "medium", time: "5 min" },
  { id: 22, text: "Take a walk and make up backstories for 3 people you pass", emoji: "🚶", difficulty: "medium", time: "10 min" },
  { id: 23, text: "Go somewhere neither of you has ever been in Provo", emoji: "🗺️", difficulty: "medium", time: "20 min" },
  { id: 24, text: "Have a 5-minute conversation where every sentence must be a question", emoji: "❓", difficulty: "medium", time: "5 min" },
  { id: 25, text: "Recreate your first date as accurately as possible in 10 minutes", emoji: "⏪", difficulty: "medium", time: "10 min" },
  { id: 26, text: "Pick a random recipe online and make it together with whatever you have", emoji: "👨‍🍳", difficulty: "medium", time: "30 min" },
  { id: 27, text: "Leave a kind note or treat for a stranger to find", emoji: "💌", difficulty: "medium", time: "10 min" },
  { id: 28, text: "Find a hill or viewpoint and watch the sunset together — phones away", emoji: "🌅", difficulty: "medium", time: "20 min" },
  { id: 29, text: "Play 20 questions but you can only ask about the other person's dreams", emoji: "💭", difficulty: "medium", time: "10 min" },
  { id: 30, text: "Go to a thrift store and find the funniest item for under $3", emoji: "🛍️", difficulty: "medium", time: "15 min" },
  { id: 31, text: "Write a short poem about each other and read them aloud at the same time", emoji: "📜", difficulty: "medium", time: "10 min" },
  { id: 32, text: "Take turns being a tour guide and make up fake history about landmarks you pass", emoji: "🏛️", difficulty: "medium", time: "10 min" },

  // ── Bold (rose) ──
  { id: 33, text: "Serenade each other in a public place — even if you can't sing", emoji: "🎤", difficulty: "bold", time: "5 min" },
  { id: 34, text: "Ask a stranger to rate your date on a scale of 1-10 and give tips", emoji: "⭐", difficulty: "bold", time: "5 min" },
  { id: 35, text: "Do a complete role reversal — act like each other for 15 minutes", emoji: "🎭", difficulty: "bold", time: "15 min" },
  { id: 36, text: "Go to a restaurant and order entirely in a made-up language using gestures", emoji: "🌍", difficulty: "bold", time: "10 min" },
  { id: 37, text: "Approach a couple and challenge them to a mini-competition (thumb war, trivia, etc.)", emoji: "🏆", difficulty: "bold", time: "10 min" },
  { id: 38, text: "Film a 30-second commercial for your relationship and post it to your story", emoji: "📹", difficulty: "bold", time: "10 min" },
  { id: 39, text: "Go to a bookstore, each pick a random book, and read a page dramatically to each other", emoji: "📚", difficulty: "bold", time: "15 min" },
  { id: 40, text: "Ask a stranger to give you a dare and then do it", emoji: "🎲", difficulty: "bold", time: "10 min" },
  { id: 41, text: "Have a dance-off in a public place — someone nearby judges the winner", emoji: "💃", difficulty: "bold", time: "5 min" },
  { id: 42, text: "Go to a grocery store and create the weirdest ice cream combo, then actually try it", emoji: "🍦", difficulty: "bold", time: "15 min" },
  { id: 43, text: "Stand on a bench and give a 30-second speech about why your date is amazing", emoji: "📢", difficulty: "bold", time: "3 min" },
  { id: 44, text: "Do an entire activity communicating only through drawings — no words or gestures", emoji: "✏️", difficulty: "bold", time: "15 min" },
  { id: 45, text: "Let a stranger pick your next destination for the date", emoji: "🧭", difficulty: "bold", time: "5 min" },
  { id: 46, text: "Have a 5-minute improv scene where one person starts a story and you alternate sentences", emoji: "🎪", difficulty: "bold", time: "5 min" },
  { id: 47, text: "Go somewhere with live music and request a song for your date", emoji: "🎸", difficulty: "bold", time: "10 min" },
  { id: 48, text: "Take turns calling each other's parents to say something you appreciate about them", emoji: "❤️", difficulty: "bold", time: "10 min" },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; icon: string; color: string; bgClass: string; textClass: string; borderClass: string; glowColor: string }> = {
  easy: {
    label: "Easy",
    icon: "🟢",
    color: "#22c55e",
    bgClass: "bg-green-500/15",
    textClass: "text-green-400",
    borderClass: "border-green-500/30",
    glowColor: "rgba(34, 197, 94, 0.4)",
  },
  medium: {
    label: "Medium",
    icon: "🟡",
    color: "#f59e0b",
    bgClass: "bg-amber-500/15",
    textClass: "text-amber-400",
    borderClass: "border-amber-500/30",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  bold: {
    label: "Bold",
    icon: "🔴",
    color: "#f43f5e",
    bgClass: "bg-rose-500/15",
    textClass: "text-rose-400",
    borderClass: "border-rose-500/30",
    glowColor: "rgba(244, 63, 94, 0.4)",
  },
};

type FilterOption = Difficulty | "all";

/* ─── Helpers ─── */

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ─── Component ─── */

export default function ChallengesPage() {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [justAccepted, setJustAccepted] = useState(false);

  const filtered = useMemo(
    () => (filter === "all" ? CHALLENGES : CHALLENGES.filter((c) => c.difficulty === filter)),
    [filter]
  );

  const drawChallenge = useCallback(() => {
    setJustAccepted(false);
    setIsFlipping(true);
    setIsRevealed(false);

    setTimeout(() => {
      const available = filtered.filter((c) => !completedIds.has(c.id));
      const pool = available.length > 0 ? available : filtered;
      const shuffled = shuffleArray(pool);
      setCurrentChallenge(shuffled[0]);

      setTimeout(() => {
        setIsRevealed(true);
        setIsFlipping(false);
      }, 400);
    }, 300);
  }, [filtered, completedIds]);

  const acceptChallenge = useCallback(() => {
    if (!currentChallenge || completedIds.has(currentChallenge.id)) return;
    setCompletedIds((prev) => new Set(prev).add(currentChallenge.id));
    setCompletedCount((c) => c + 1);
    setJustAccepted(true);
  }, [currentChallenge, completedIds]);

  const diffConfig = currentChallenge ? DIFFICULTY_CONFIG[currentChallenge.difficulty] : null;

  return (
    <div className="min-h-screen bg-bg-primary px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </Link>

        {/* Completed count badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={completedCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-1.5 bg-accent-primary/15 text-accent-primary px-3 py-1.5 rounded-full text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {completedCount} done
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Date Night Challenges</h1>
        <p className="text-text-muted text-sm">Draw a card. Accept the dare. Make a memory.</p>
      </div>

      {/* Difficulty filter tabs */}
      <div className="flex gap-2 justify-center mb-8 flex-wrap">
        {(
          [
            { key: "all" as FilterOption, label: "Surprise Me", icon: "🎲" },
            { key: "easy" as FilterOption, label: "Easy", icon: "🟢" },
            { key: "medium" as FilterOption, label: "Medium", icon: "🟡" },
            { key: "bold" as FilterOption, label: "Bold", icon: "🔴" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            onClick={() => {
              setFilter(opt.key);
              setCurrentChallenge(null);
              setIsRevealed(false);
              setJustAccepted(false);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              filter === opt.key
                ? "bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/25"
                : "bg-bg-card text-text-secondary border-border hover:border-border-hover"
            }`}
          >
            <span className="mr-1.5">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Card area */}
      <div className="flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          {!currentChallenge && !isFlipping ? (
            /* Envelope / draw prompt */
            <motion.button
              key="envelope"
              onClick={drawChallenge}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative w-full max-w-sm aspect-[3/4] rounded-3xl bg-bg-card border-2 border-dashed border-border-hover flex flex-col items-center justify-center gap-4 shadow-xl cursor-pointer group"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-6xl"
              >
                ✉️
              </motion.div>
              <span className="text-text-secondary font-semibold text-lg group-hover:text-text-primary transition-colors">
                Tap to draw a challenge
              </span>
              <span className="text-text-muted text-sm">
                {filtered.length} challenges available
              </span>
            </motion.button>
          ) : isFlipping && !isRevealed ? (
            /* Flip animation placeholder */
            <motion.div
              key="flipping"
              initial={{ rotateY: 0, scale: 1 }}
              animate={{ rotateY: 180, scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-sm aspect-[3/4] rounded-3xl bg-bg-card border border-border flex items-center justify-center shadow-xl"
              style={{ perspective: 1000 }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
                className="text-5xl"
              >
                🎲
              </motion.span>
            </motion.div>
          ) : currentChallenge && isRevealed ? (
            /* Revealed challenge card */
            <motion.div
              key={`challenge-${currentChallenge.id}`}
              initial={{ rotateY: -90, scale: 0.8, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: -100 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full max-w-sm rounded-3xl bg-bg-card border border-border overflow-hidden shadow-2xl"
              style={{
                boxShadow: diffConfig
                  ? `0 0 40px ${diffConfig.glowColor}, 0 20px 60px rgba(0,0,0,0.3)`
                  : undefined,
              }}
            >
              {/* Glow accent bar at top */}
              <div
                className="h-1.5 w-full"
                style={{ background: diffConfig?.color }}
              />

              <div className="p-6 flex flex-col items-center text-center gap-5">
                {/* Difficulty badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${diffConfig?.bgClass} ${diffConfig?.textClass} ${diffConfig?.borderClass}`}
                >
                  {diffConfig?.icon} {diffConfig?.label}
                </motion.div>

                {/* Emoji */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="text-6xl"
                >
                  {currentChallenge.emoji}
                </motion.div>

                {/* Challenge text */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-text-primary font-semibold text-lg leading-relaxed"
                >
                  {currentChallenge.text}
                </motion.p>

                {/* Time estimate */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-1.5 text-text-muted text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~{currentChallenge.time}
                </motion.div>

                {/* Completed overlay */}
                <AnimatePresence>
                  {justAccepted && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: [0, 1.3, 1], rotate: [0, 10, 0] }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/40">
                          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        <span className="text-white font-bold text-lg">Challenge Accepted!</span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Action buttons */}
        {currentChallenge && isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3 w-full max-w-sm"
          >
            <motion.button
              onClick={drawChallenge}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-bg-secondary text-text-secondary font-semibold border border-border hover:border-border-hover transition-colors"
            >
              <motion.span
                animate={isFlipping ? { rotate: 360 } : {}}
                transition={{ duration: 0.4 }}
              >
                🔀
              </motion.span>
              Draw Another
            </motion.button>

            {!completedIds.has(currentChallenge.id) && !justAccepted ? (
              <motion.button
                onClick={acceptChallenge}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-accent-primary text-white font-semibold shadow-lg shadow-accent-primary/25"
              >
                <span>✅</span>
                Accept Challenge
              </motion.button>
            ) : (
              <motion.button
                onClick={drawChallenge}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-accent-secondary text-white font-semibold shadow-lg shadow-accent-secondary/25"
              >
                <span>🎯</span>
                Next Challenge
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom spacer for nav clearance */}
      <div className="mb-16" />
    </div>
  );
}
