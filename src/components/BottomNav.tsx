"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    ),
  },
  {
    href: "/explore",
    label: "Explore",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    ),
  },
  {
    href: "/plan",
    label: "Plan",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    ),
    isPrimary: true,
  },
  {
    href: "/saved",
    label: "Saved",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    ),
  },
];

// Pages where the bottom nav should NOT appear
const HIDE_ON = ["/auth", "/concierge", "/results", "/conversation", "/challenges"];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on certain pages
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;
  // Hide on idea detail pages
  if (pathname.startsWith("/idea/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:max-w-lg md:mx-auto">
      <div className="bg-bg-card/95 backdrop-blur-xl border-t border-border px-2 pb-[env(safe-area-inset-bottom,8px)]">
        <div className="flex items-center justify-around h-14">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            if (item.isPrimary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -mt-5 flex items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-lg shadow-accent-primary/30 transition-transform active:scale-90 hover:scale-105">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      {item.icon}
                    </svg>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-0.5 py-1 px-3 group"
              >
                <div className="relative">
                  <svg
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive
                        ? "text-accent-primary"
                        : "text-text-muted group-hover:text-text-secondary"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={isActive ? 2.5 : 1.5}
                  >
                    {item.icon}
                  </svg>
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-accent-primary"
                      : "text-text-muted group-hover:text-text-secondary"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
