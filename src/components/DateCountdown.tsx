"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

function getNextFriday(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilFriday = day <= 5 ? 5 - day : 6; // 5 = Friday
  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilFriday);
  friday.setHours(19, 0, 0, 0);
  if (friday <= now) {
    friday.setDate(friday.getDate() + 7);
  }
  return friday;
}

function getNextSaturday(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSaturday = day <= 6 ? 6 - day : 0;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + (daysUntilSaturday || 7));
  saturday.setHours(18, 0, 0, 0);
  if (saturday <= now) {
    saturday.setDate(saturday.getDate() + 7);
  }
  return saturday;
}

function formatTimeLeft(ms: number): { days: number; hours: number; minutes: number; seconds: number } {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds };
}

export default function DateCountdown() {
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  // Load saved target from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("rendition-countdown");
    if (saved) {
      const d = new Date(saved);
      if (d > new Date()) {
        setTargetDate(d);
      } else {
        localStorage.removeItem("rendition-countdown");
      }
    }
  }, []);

  // Tick every second when countdown is active
  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const timeLeft = useMemo(() => {
    if (!targetDate) return null;
    const ms = targetDate.getTime() - now.getTime();
    if (ms <= 0) return null;
    return formatTimeLeft(ms);
  }, [targetDate, now]);

  const setCountdown = (date: Date) => {
    setTargetDate(date);
    localStorage.setItem("rendition-countdown", date.toISOString());
    setIsExpanded(false);
  };

  const clearCountdown = () => {
    setTargetDate(null);
    localStorage.removeItem("rendition-countdown");
  };

  // If countdown is expired
  if (targetDate && !timeLeft) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-accent-primary/10 border border-accent-primary/20 rounded-2xl p-4 text-center"
      >
        <p className="text-lg font-bold text-accent-primary">It&apos;s date night!</p>
        <p className="text-xs text-text-muted mt-1">Time to have some fun</p>
        <button
          onClick={clearCountdown}
          className="mt-2 text-xs text-text-muted hover:text-text-secondary"
        >
          Clear
        </button>
      </motion.div>
    );
  }

  // Active countdown
  if (timeLeft) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-border rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Next date night
          </p>
          <button
            onClick={clearCountdown}
            className="text-xs text-text-muted hover:text-error transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: timeLeft.days, label: "Days" },
            { value: timeLeft.hours, label: "Hours" },
            { value: timeLeft.minutes, label: "Min" },
            { value: timeLeft.seconds, label: "Sec" },
          ].map((unit) => (
            <div key={unit.label} className="text-center">
              <motion.p
                key={unit.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-extrabold text-accent-primary tabular-nums"
              >
                {String(unit.value).padStart(2, "0")}
              </motion.p>
              <p className="text-[10px] text-text-muted uppercase">{unit.label}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-text-muted mt-2">
          {targetDate!.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}{" "}
          at{" "}
          {targetDate!.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </motion.div>
    );
  }

  // No countdown set — show set button
  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-bg-card border border-border rounded-2xl hover:border-border-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-text-primary">Set date night</p>
            <p className="text-[11px] text-text-muted">Start a countdown</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  const tonight = new Date();
                  tonight.setHours(19, 0, 0, 0);
                  if (tonight <= new Date()) tonight.setDate(tonight.getDate() + 1);
                  setCountdown(tonight);
                }}
                className="py-3 px-4 bg-bg-card border border-border rounded-xl text-sm font-medium text-text-primary hover:border-accent-primary transition-colors text-left"
              >
                Tonight at 7pm
              </button>
              <button
                onClick={() => setCountdown(getNextFriday())}
                className="py-3 px-4 bg-bg-card border border-border rounded-xl text-sm font-medium text-text-primary hover:border-accent-primary transition-colors text-left"
              >
                This Friday at 7pm
              </button>
              <button
                onClick={() => setCountdown(getNextSaturday())}
                className="py-3 px-4 bg-bg-card border border-border rounded-xl text-sm font-medium text-text-primary hover:border-accent-primary transition-colors text-left"
              >
                This Saturday at 6pm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
