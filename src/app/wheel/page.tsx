"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";
import { getCurrentSeason } from "@/lib/constants";

const allIdeas = dateIdeas as DateIdea[];

const SEGMENT_COLORS = [
  { bg: "#f43f5e", label: "rose" },
  { bg: "#f59e0b", label: "amber" },
  { bg: "#10b981", label: "emerald" },
  { bg: "#0ea5e9", label: "sky" },
  { bg: "#8b5cf6", label: "violet" },
  { bg: "#f97316", label: "orange" },
  { bg: "#14b8a6", label: "teal" },
  { bg: "#ec4899", label: "pink" },
];

const NUM_SEGMENTS = 8;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function formatCost(dollars: number): string {
  if (dollars === 0) return "Free";
  return `$${dollars}`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function WheelPage() {
  const season = getCurrentSeason();

  const wheelIdeas = useMemo(() => {
    const seasonal = allIdeas.filter(
      (idea) =>
        !idea.seasonalAvailability ||
        idea.seasonalAvailability.length === 0 ||
        idea.seasonalAvailability.includes(season)
    );
    const pool = seasonal.length >= NUM_SEGMENTS ? seasonal : allIdeas;
    return shuffleArray(pool).slice(0, NUM_SEGMENTS);
  }, [season]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<DateIdea | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [rotation, setRotation] = useState(0);
  const cumulativeRotation = useRef(0);

  const spin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    setShowResult(false);

    // Random number of full spins (5-8) plus random final offset
    const fullSpins = 5 + Math.floor(Math.random() * 4);
    const randomOffset = Math.random() * 360;
    const totalDegrees = fullSpins * 360 + randomOffset;

    const newRotation = cumulativeRotation.current + totalDegrees;
    cumulativeRotation.current = newRotation;
    setRotation(newRotation);

    // The pointer is at the top (0 degrees). After rotation, figure out which
    // segment is under the pointer. The wheel rotates clockwise, so the
    // segment at the top corresponds to the normalized angle.
    const normalizedAngle = ((360 - (newRotation % 360)) + 360) % 360;
    const winnerIndex = Math.floor(normalizedAngle / SEGMENT_ANGLE) % NUM_SEGMENTS;

    // Wait for animation to finish, then show result
    setTimeout(() => {
      setWinner(wheelIdeas[winnerIndex]);
      setIsSpinning(false);
      setTimeout(() => setShowResult(true), 200);
    }, 4200);
  }, [isSpinning, wheelIdeas]);

  const resetWheel = useCallback(() => {
    setWinner(null);
    setShowResult(false);
  }, []);

  const cx = 150;
  const cy = 150;
  const radius = 145;

  return (
    <div className="min-h-[100dvh] bg-bg-primary px-4 py-8 pb-24">
      {/* Header */}
      <div className="max-w-md mx-auto mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-card border border-border hover:border-border-hover transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-primary"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">
            Spin the Wheel
          </h1>
        </div>
        <p className="text-text-muted text-sm ml-[52px]">
          Let fate decide your date night
        </p>
      </div>

      {/* Wheel Section */}
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Pointer */}
        <div className="relative z-10 mb-[-12px]">
          <svg width="28" height="20" viewBox="0 0 28 20">
            <polygon
              points="14,20 0,0 28,0"
              fill="#f43f5e"
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Wheel */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          <motion.svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-2xl"
            animate={{ rotate: rotation }}
            transition={{
              duration: 4,
              ease: [0.15, 0.85, 0.25, 1],
            }}
            style={{ originX: "50%", originY: "50%" }}
          >
            {/* Outer ring */}
            <circle
              cx={cx}
              cy={cy}
              r={radius + 3}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="3"
            />

            {wheelIdeas.map((idea, i) => {
              const startAngle = i * SEGMENT_ANGLE;
              const endAngle = startAngle + SEGMENT_ANGLE;
              const midAngle = startAngle + SEGMENT_ANGLE / 2;
              const color = SEGMENT_COLORS[i];

              // Text position along the middle of the segment
              const textRadius = radius * 0.62;
              const textPoint = polarToCartesian(cx, cy, textRadius, midAngle);
              const textRotation = midAngle;

              return (
                <g key={idea.id}>
                  <path
                    d={describeArc(cx, cy, radius, startAngle, endAngle)}
                    fill={color.bg}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={textPoint.x}
                    y={textPoint.y}
                    fill="white"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${textPoint.x}, ${textPoint.y})`}
                    style={{
                      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {truncate(idea.title, 18)}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle cx={cx} cy={cy} r="28" fill="#1e1e2e" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="18" fill="#2a2a3e" />
            <text
              x={cx}
              y={cy}
              fill="white"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              opacity="0.7"
            >
              DATE
            </text>
          </motion.svg>
        </div>

        {/* Spin Button */}
        <motion.button
          onClick={spin}
          disabled={isSpinning}
          className="mt-6 px-12 py-4 rounded-2xl font-bold text-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isSpinning
              ? "linear-gradient(135deg, #6b7280, #4b5563)"
              : "linear-gradient(135deg, #f43f5e, #ec4899)",
            boxShadow: isSpinning
              ? "none"
              : "0 4px 20px rgba(244, 63, 94, 0.4)",
          }}
          whileTap={isSpinning ? {} : { scale: 0.95 }}
          whileHover={isSpinning ? {} : { scale: 1.05 }}
        >
          {isSpinning ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="inline-block"
              >
                &#10042;
              </motion.span>
              Spinning...
            </span>
          ) : winner ? (
            "Spin Again"
          ) : (
            "SPIN"
          )}
        </motion.button>

        {/* Result */}
        <AnimatePresence mode="wait">
          {showResult && winner && (
            <motion.div
              key={winner.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mt-8 w-full max-w-sm"
            >
              <div className="bg-bg-card border border-border rounded-2xl p-6 text-center">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-2 font-medium">
                  Your date night is...
                </p>
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  {winner.title}
                </h2>

                <div className="flex justify-center gap-4 mb-5 text-sm">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-text-muted text-xs">Cost</span>
                    <span className="font-semibold text-text-primary">
                      {formatCost(winner.estimatedCostDollars)}
                    </span>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-text-muted text-xs">Time</span>
                    <span className="font-semibold text-text-primary">
                      {formatTime(winner.estimatedTimeMinutes)}
                    </span>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-text-muted text-xs">Category</span>
                    <span className="font-semibold text-text-primary capitalize">
                      {winner.category.replace("-", " & ").replace("-", " ")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/idea/${winner.id}`}
                    className="flex-1 py-3 rounded-xl font-semibold text-white text-center transition-all hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #f43f5e, #ec4899)",
                    }}
                  >
                    Let&apos;s do it
                  </Link>
                  <button
                    onClick={resetWheel}
                    className="flex-1 py-3 rounded-xl font-semibold text-text-primary bg-bg-secondary border border-border hover:border-border-hover transition-colors"
                  >
                    Spin again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
