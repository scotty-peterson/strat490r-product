"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const VISITED_KEY = "rendition-visited";

export default function WelcomeOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(VISITED_KEY)) {
        setShow(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(VISITED_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-bg-primary/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-bg-card rounded-2xl border-2 border-border p-8 max-w-sm w-full text-center shadow-xl"
          >
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-accent-primary/15 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-accent-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold text-text-primary mb-2">
              Welcome to Rendition
            </h2>
            <p className="text-sm text-text-secondary mb-1">
              Date nights in Provo, curated for tonight.
            </p>
            <p className="text-xs text-text-muted mb-8 max-w-xs mx-auto">
              Answer 4 quick questions and get 3 vetted ideas you can act on
              right now. No scrolling, no arguing.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/concierge"
                onClick={dismiss}
                className="w-full py-4 bg-accent-primary text-white font-bold rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center"
              >
                Find Your Night
              </Link>
              <button
                onClick={dismiss}
                className="text-sm text-text-muted font-medium hover:text-text-secondary transition-colors"
              >
                I know the drill — skip
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
