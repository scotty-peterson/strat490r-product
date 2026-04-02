"use client";

import { useState, useCallback, useEffect } from "react";
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
  getSuggestedTimeRange,
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

const STEP_ICONS = [
  // Clock
  <svg key="clock" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
  // Wallet
  <svg key="wallet" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>,
  // Sparkles
  <svg key="sparkles" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
  </svg>,
  // Map pin
  <svg key="map" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>,
];

export default function ConciergePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [filters, setFilters] = useState<Partial<ConciergeFilters>>(() => ({
    moods: [],
    timeRange: undefined,
  }));
  const [weatherHint, setWeatherHint] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://wttr.in/Provo,UT?format=j1")
      .then((r) => r.json())
      .then((data) => {
        const c = data?.current_condition?.[0];
        if (!c) return;
        const tempF = parseInt(c.temp_F, 10);
        const code = parseInt(c.weatherCode, 10);
        if (tempF <= 32) setWeatherHint(`It's ${tempF}\u00B0F outside \u2014 indoor might be the move`);
        else if (code >= 300) setWeatherHint("Weather looks rough \u2014 consider staying inside");
        else if (tempF >= 70) setWeatherHint(`${tempF}\u00B0F and nice out \u2014 great evening for outdoor`);
      })
      .catch(() => {});
  }, []);

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
            icon={STEP_ICONS[0]}
            stepIndex={0}
          >
            <div className="flex flex-col gap-3 w-full">
              {TIME_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.value}
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
            icon={STEP_ICONS[1]}
            stepIndex={1}
          >
            <div className="flex flex-col gap-3 w-full">
              {BUDGET_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.value}
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
            icon={STEP_ICONS[2]}
            stepIndex={2}
          >
            <div className="grid grid-cols-2 gap-3 w-full">
              {MOOD_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.value}
                  label={opt.label}
                  subtitle={opt.subtitle}
                  selected={filters.moods?.includes(opt.value) || false}
                  onClick={() => handleMoodToggle(opt.value)}
                />
              ))}
            </div>
            {(filters.moods?.length || 0) > 0 && (
              <button
                onClick={goForward}
                className="mt-6 w-full py-4 bg-accent-primary text-white font-bold rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
            subtitle={weatherHint || "Or keep it open"}
            icon={STEP_ICONS[3]}
            stepIndex={3}
          >
            <div className="flex flex-col gap-3 w-full">
              {SETTING_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.value}
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
      <div className="flex items-center justify-between px-4 md:px-8 pt-4 pb-2 md:max-w-lg md:mx-auto md:w-full">
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
      <div className="flex-1 flex items-start justify-center px-6 pt-8 overflow-hidden md:pt-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full max-w-sm md:max-w-md"
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
  icon,
  stepIndex,
  children,
}: {
  question: string;
  subtitle: string;
  icon: React.ReactNode;
  stepIndex: number;
  children: React.ReactNode;
}) {
  const colors = [
    "bg-accent-primary/12 text-accent-primary",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-accent-secondary",
    "bg-blue-100 text-blue-700",
  ];

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${colors[stepIndex]}`}>
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-1 text-center">
        {question}
      </h2>
      <p className="text-sm text-text-muted mb-6 text-center">{subtitle}</p>
      {children}
    </div>
  );
}
