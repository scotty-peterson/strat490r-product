"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import dateIdeas from "@/data/date-ideas.json";
import { DateIdea } from "@/lib/types";
import IdeaCard from "@/components/results/IdeaCard";

export default function SavedPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?next=/saved");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("saved_ideas")
      .select("idea_id")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false })
      .then(({ data }) => {
        setSavedIds((data || []).map((row) => row.idea_id));
        setDataLoading(false);
      });
  }, [user]);

  const savedIdeas = (dateIdeas as DateIdea[]).filter((idea) =>
    savedIds.includes(idea.id)
  );

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-bg-primary">
        <div className="text-text-muted">Loading…</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-4 pb-2 md:max-w-3xl md:mx-auto md:w-full">
        <Link
          href="/concierge"
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
        </Link>
        <h1 className="text-sm font-semibold text-text-secondary">
          Saved Ideas
        </h1>
        <button
          onClick={handleSignOut}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors px-2 py-1"
        >
          Sign out
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8 md:max-w-3xl md:mx-auto md:w-full">
        <div className="pt-4 pb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            Your saved ideas
          </h2>
          <p className="text-sm text-text-muted mt-1">{user.email}</p>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-text-muted">Loading your saves…</p>
          </div>
        ) : savedIdeas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {/* Illustration */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-accent-primary/10 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-accent-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-accent-secondary/15 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-accent-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-bold text-text-primary mb-2">
              No saved ideas yet
            </h3>
            <p className="text-sm text-text-muted mb-2 max-w-[260px]">
              When you find an idea you love, tap the heart to save it here for later.
            </p>
            <p className="text-xs text-text-muted mb-8 max-w-[240px]">
              Your favorites will be waiting for you right here.
            </p>

            <Link
              href="/concierge"
              className="py-4 px-8 bg-accent-primary text-white font-bold rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              Find Your First Date Night
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            {savedIdeas.map((idea, i) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <IdeaCard idea={idea} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
