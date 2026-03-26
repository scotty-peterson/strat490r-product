"use client";

import { useState } from "react";

const CITIES = [
  { id: "provo", label: "Provo, UT", active: true },
  { id: "slc", label: "Salt Lake City, UT", active: false },
  { id: "logan", label: "Logan, UT", active: false },
  { id: "rexburg", label: "Rexburg, ID", active: false },
];

export default function CitySelector() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
      >
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
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Provo, UT
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-52 bg-bg-card border-2 border-border rounded-2xl shadow-lg z-50 overflow-hidden">
            {CITIES.map((city) => (
              <button
                key={city.id}
                onClick={() => {
                  if (city.active) setOpen(false);
                }}
                disabled={!city.active}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  city.active
                    ? "text-accent-primary font-semibold bg-accent-primary/5"
                    : "text-text-muted cursor-default"
                }`}
              >
                <span className="flex items-center justify-between">
                  {city.label}
                  {city.active ? (
                    <svg className="w-4 h-4 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs text-text-muted">Soon</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
