"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  TimeRange,
  BudgetTier,
  Mood,
  Setting,
  ConciergeFilters,
} from "@/lib/types";
import {
  TIME_OPTIONS,
  BUDGET_OPTIONS,
  MOOD_OPTIONS,
  SETTING_OPTIONS,
} from "@/lib/constants";
import OptionPill from "@/components/ui/OptionPill";
import ProgressDots from "@/components/ui/ProgressDots";

const TOTAL_STEPS = 4;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export default function ConciergePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [filters, setFilters] = useState<Partial<ConciergeFilters>>({
    moods: [],
  });

  const goForward = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const goBack = useCallback(() => {
    if (step === 0) {
      router.push("/");
      return;
    }
    setDirection(-1);
    setStep((s) => s - 1);
  }, [step, router]);

  const handleTimeSelect = (time: TimeRange) => {
    setFilters((prev) => ({ ...prev, timeRange: time }));
    setTimeout(goForward, 200);
  };

  const handleBudgetSelect = (budget: BudgetTier) => {
    setFilters((prev) => ({ ...prev, budgetTier: budget }));
    setTimeout(goForward, 200);
  };

  const handleMoodToggle = (mood: Mood) => {
    setFilters((prev) => {
      const current = prev.moods || [];
      const updated = current.includes(mood)
        ? current.filter((m) => m !== mood)
        : current.length < 3
          ? [...current, mood]
          : current;
      return { ...prev, moods: updated };
    });
  };

  const handleSettingSelect = (setting: Setting | "no-preference") => {
    const finalFilters = { ...filters, setting } as ConciergeFilters;
    const params = new URLSearchParams({
      time: finalFilters.timeRange,
      budget: finalFilters.budgetTier,
      moods: finalFilters.moods.join(","),
      setting: finalFilters.setting,
    });
    router.push(`/results?${params.toString()}`);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <StepContainer
            question="How much time do you have?"
            subtitle="Pick one"
          >
            <div className="flex flex-col gap-3 w-full">
              {TIME_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.value}
                  icon={opt.icon}
                  label={opt.label}
                  selected={filters.timeRange === opt.value}
                  onClick={() => handleTimeSelect(opt.value)}
                />
              ))}
            </div>
          </StepContainer>
        );
      case 1:
        return (
          <StepContainer
            question="What's the budget?"
            subtitle="Per person, roughly"
          >
            <div className="flex flex-col gap-3 w-full">
              {BUDGET_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.value}
                  icon={opt.icon}
                  label={opt.label}
                  selected={filters.budgetTier === opt.value}
                  onClick={() => handleBudgetSelect(opt.value)}
                />
              ))}
            </div>
          </StepContainer>
        );
      case 2:
        return (
          <StepContainer
            question="What's the vibe?"
            subtitle="Pick up to 3"
          >
            <div className="flex flex-col gap-3 w-full">
              {MOOD_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.value}
                  icon={opt.icon}
                  label={opt.label}
                  selected={filters.moods?.includes(opt.value) || false}
                  onClick={() => handleMoodToggle(opt.value)}
                />
              ))}
            </div>
            {(filters.moods?.length || 0) > 0 && (
              <button
                onClick={goForward}
                className="mt-6 w-full py-4 bg-accent-primary text-bg-primary font-bold rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Next
              </button>
            )}
          </StepContainer>
        );
      case 3:
        return (
          <StepContainer
            question="Indoor or outdoor?"
            subtitle="Or keep it open"
          >
            <div className="flex flex-col gap-3 w-full">
              {SETTING_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.value}
                  icon={opt.icon}
                  label={opt.label}
                  selected={filters.setting === opt.value}
                  onClick={() => handleSettingSelect(opt.value)}
                />
              ))}
            </div>
          </StepContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={goBack}
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
        </button>
        <ProgressDots current={step} total={TOTAL_STEPS} />
        <div className="w-10" />
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-6 pt-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full max-w-sm"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepContainer({
  question,
  subtitle,
  children,
}: {
  question: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl font-bold text-text-primary mb-1 text-center">
        {question}
      </h2>
      <p className="text-sm text-text-muted mb-8 text-center">{subtitle}</p>
      {children}
    </div>
  );
}
