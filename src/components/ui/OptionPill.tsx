"use client";

import { cn } from "@/lib/utils";

interface OptionPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function OptionPill({
  label,
  selected,
  onClick,
}: OptionPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.97]",
        selected
          ? "border-accent-primary bg-accent-primary/10 text-text-primary shadow-md"
          : "border-border bg-bg-card text-text-secondary hover:border-border-hover hover:bg-bg-card-hover"
      )}
    >
      <span className="text-base font-semibold">{label}</span>
      {selected && (
        <svg
          className="ml-auto w-5 h-5 text-accent-primary"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
