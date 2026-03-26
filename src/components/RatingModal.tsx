"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RatingModalProps {
  isOpen: boolean;
  ideaTitle: string;
  initialRating?: number;
  initialNote?: string;
  onSubmit: (rating: number, note?: string) => Promise<void>;
  onClose: () => void;
  isEditing?: boolean;
}

export default function RatingModal({
  isOpen,
  ideaTitle,
  initialRating = 0,
  initialNote = "",
  onSubmit,
  onClose,
  isEditing = false,
}: RatingModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [note, setNote] = useState(initialNote);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await onSubmit(rating, note.trim() || undefined);
    setSubmitting(false);
  };

  const displayRating = hoveredRating || rating;

  const ratingLabels = ["", "Not great", "It was okay", "Had fun", "Really good", "Unforgettable"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md"
          >
            <div className="bg-bg-card rounded-3xl border border-border shadow-xl p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-success"
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
                </div>
                <h2 className="text-xl font-bold text-text-primary">
                  {isEditing ? "Update Your Rating" : "How was it?"}
                </h2>
                <p className="text-sm text-text-muted mt-1 line-clamp-1">
                  {ideaTitle}
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform duration-150 hover:scale-110 active:scale-95"
                  >
                    <svg
                      className={`w-10 h-10 transition-colors duration-150 ${
                        star <= displayRating
                          ? "text-amber-400 fill-amber-400"
                          : "text-border fill-none"
                      }`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Rating label */}
              <p className="text-center text-sm text-text-muted mb-5 h-5">
                {displayRating > 0 ? ratingLabels[displayRating] : "Tap a star to rate"}
              </p>

              {/* Note input */}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Quick memory from tonight... (optional)"
                rows={2}
                maxLength={280}
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-2xl text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-primary transition-colors"
              />
              <p className="text-xs text-text-muted text-right mt-1 mb-4">
                {note.length}/280
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-border text-text-secondary font-semibold rounded-2xl text-sm transition-all duration-200 hover:border-border-hover active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0 || submitting}
                  className="flex-1 py-3 bg-accent-primary text-white font-bold rounded-2xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                >
                  {submitting
                    ? "Saving..."
                    : isEditing
                      ? "Update"
                      : "Log This Date"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
