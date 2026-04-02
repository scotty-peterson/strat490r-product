"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DateIdea } from "@/lib/types";

interface RecapCardProps {
  idea: DateIdea;
  rating: number;
  note?: string;
  completedAt: string;
  onClose: () => void;
}

const RATING_LABELS = ["", "Meh", "Okay", "Fun!", "Great!", "Amazing!"];

const GRADIENT_PAIRS = [
  ["#c4703e", "#d4956b"],
  ["#7c6cae", "#9b8fc4"],
  ["#3aa76d", "#5bc489"],
  ["#d4956b", "#e8b896"],
  ["#5e4f8c", "#7c6cae"],
];

function getGradient(ideaId: string): string[] {
  const hash = ideaId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
}

export default function RecapCard({ idea, rating, note, completedAt, onClose }: RecapCardProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [grad1, grad2] = getGradient(idea.id);

  const dateStr = new Date(completedAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const handleShare = useCallback(async () => {
    const text = `${idea.title} ${RATING_LABELS[rating] || ""}\n${"★".repeat(rating)}${"☆".repeat(5 - rating)}\n${note ? `"${note}"\n` : ""}Tracked with Rendition`;
    const url = `${window.location.origin}/idea/${idea.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Date night: ${idea.title}`,
          text,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [idea, rating, note]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm"
        >
          {/* The card itself */}
          <div
            ref={cardRef}
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${grad1}, ${grad2})`,
            }}
          >
            {/* Top section */}
            <div className="px-6 pt-8 pb-4">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
                Date Night Recap
              </p>
              <p className="text-white/50 text-[11px]">{dateStr}</p>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <h2 className="text-2xl font-extrabold text-white leading-tight mb-4">
                {idea.title}
              </h2>

              {/* Stars */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-xl ${star <= rating ? "opacity-100" : "opacity-30"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-white/80 text-sm font-semibold">
                  {RATING_LABELS[rating]}
                </span>
              </div>

              {/* Note */}
              {note && (
                <div className="bg-white/15 rounded-2xl px-4 py-3 mb-4 backdrop-blur-sm">
                  <p className="text-white/90 text-sm italic leading-relaxed">
                    &ldquo;{note}&rdquo;
                  </p>
                </div>
              )}

              {/* Quick facts */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-[11px] text-white/60 font-medium px-2.5 py-1 rounded-full border border-white/20">
                  {idea.setting === "indoor" ? "Indoor" : idea.setting === "outdoor" ? "Outdoor" : "Either"}
                </span>
                <span className="text-[11px] text-white/60 font-medium px-2.5 py-1 rounded-full border border-white/20">
                  {idea.estimatedCostDollars === 0 ? "Free" : `$${idea.estimatedCostDollars}`}
                </span>
                {idea.specificLocation && (
                  <span className="text-[11px] text-white/60 font-medium px-2.5 py-1 rounded-full border border-white/20">
                    {idea.specificLocation}
                  </span>
                )}
              </div>
            </div>

            {/* Brand footer */}
            <div className="px-6 py-3 bg-black/10 flex items-center justify-between">
              <span className="text-white/40 text-xs font-semibold tracking-wide">
                Rendition
              </span>
              <span className="text-white/30 text-[10px]">
                provo date nights
              </span>
            </div>
          </div>

          {/* Action buttons below card */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleShare}
              className="flex-1 py-3.5 bg-white text-text-primary font-bold rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? "Copied!" : "Share Recap"}
            </button>
            <button
              onClick={onClose}
              className="py-3.5 px-5 bg-white/20 text-white font-semibold rounded-2xl text-sm transition-all hover:bg-white/30 active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
