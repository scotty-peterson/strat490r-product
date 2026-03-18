"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { DateIdea } from "@/lib/types";

const MOOD_COLORS: Record<string, string> = {
  chill: "bg-blue-50 text-blue-700",
  adventurous: "bg-orange-50 text-orange-700",
  romantic: "bg-pink-50 text-pink-700",
  social: "bg-green-50 text-green-700",
  creative: "bg-purple-50 text-purple-700",
  active: "bg-red-50 text-red-700",
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
  const router = useRouter();

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = `${window.location.origin}/idea/${idea.id}`;
      const shareData = {
        title: idea.title,
        text: idea.description.slice(0, 120),
        url,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch {
          // User cancelled
        }
      } else {
        await navigator.clipboard.writeText(url);
      }
    },
    [idea]
  );

  return (
    <div
      onClick={() => router.push(`/idea/${idea.id}`)}
      className="bg-bg-card rounded-2xl border-2 border-border transition-all duration-200 hover:border-border-hover hover:bg-bg-card-hover active:scale-[0.98] cursor-pointer"
    >
      <div className="p-5">
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
                Late night
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
              <svg
                className="w-3 h-3 inline-block mr-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {idea.specificLocation}
            </span>
          )}
        </div>
      </div>

      {/* Share row */}
      <div className="border-t border-border px-5">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-xs text-text-muted hover:text-accent-primary transition-colors min-h-[48px] font-medium w-full"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          It&apos;s a date — share this
        </button>
      </div>
    </div>
  );
}
