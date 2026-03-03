"use client";

import Link from "next/link";
import { DateIdea } from "@/lib/types";

const MOOD_COLORS: Record<string, string> = {
  chill: "bg-blue-500/20 text-blue-300",
  adventurous: "bg-orange-500/20 text-orange-300",
  romantic: "bg-pink-500/20 text-pink-300",
  social: "bg-green-500/20 text-green-300",
  creative: "bg-purple-500/20 text-purple-300",
  active: "bg-red-500/20 text-red-300",
};

function formatCost(dollars: number): string {
  if (dollars === 0) return "Free";
  return `$${dollars}`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

export default function IdeaCard({ idea }: { idea: DateIdea }) {
  return (
    <Link href={`/idea/${idea.id}`}>
      <div className="bg-bg-card rounded-2xl p-5 border-2 border-border transition-all duration-200 hover:border-border-hover hover:bg-bg-card-hover active:scale-[0.98] cursor-pointer">
        <h3 className="text-lg font-bold text-text-primary mb-2">
          {idea.title}
        </h3>
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {idea.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
          <span className="flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {formatTime(idea.estimatedTimeMinutes)}
          </span>
          <span>·</span>
          <span>{formatCost(idea.estimatedCostDollars)}</span>
          {idea.lateNightFriendly && (
            <>
              <span>·</span>
              <span className="text-accent-secondary flex items-center gap-1">
                🌙 Late night
              </span>
            </>
          )}
        </div>

        {/* Mood badges */}
        <div className="flex flex-wrap gap-1.5">
          {idea.moods.map((mood) => (
            <span
              key={mood}
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${MOOD_COLORS[mood] || "bg-border text-text-secondary"}`}
            >
              {mood}
            </span>
          ))}
          {idea.specificLocation && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-accent-primary/10 text-accent-primary">
              📍 {idea.specificLocation}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
