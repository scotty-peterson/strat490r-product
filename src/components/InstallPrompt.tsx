"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed recently
    const dismissed = sessionStorage.getItem("rendition-install-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after a short delay so user has time to see the app first
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("rendition-install-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:max-w-sm md:mx-auto"
        >
          <div className="bg-bg-card border border-border rounded-2xl p-4 shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-lg">R</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary">
                Add Rendition to home screen
              </p>
              <p className="text-xs text-text-muted">
                Quick access, works offline
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleDismiss}
                className="text-xs text-text-muted hover:text-text-secondary px-2 py-1"
              >
                Later
              </button>
              <button
                onClick={handleInstall}
                className="text-xs font-bold text-white bg-accent-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Install
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
