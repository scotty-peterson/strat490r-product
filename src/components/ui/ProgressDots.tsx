"use client";

interface ProgressDotsProps {
  current: number;
  total: number;
}

export default function ProgressDots({ current, total }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current
              ? "w-8 bg-accent-primary"
              : i < current
                ? "w-2 bg-accent-primary/50"
                : "w-2 bg-border"
          }`}
        />
      ))}
    </div>
  );
}
