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
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
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
      <div className="flex-1 px-6 pb-8">
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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-4">🔖</div>
            <p className="text-text-secondary font-medium mb-2">
              Nothing saved yet
            </p>
            <p className="text-text-muted text-sm mb-6">
              Tap the heart on any idea to save it here.
            </p>
            <Link
              href="/concierge"
              className="py-3 px-6 bg-accent-primary text-bg-primary font-bold rounded-2xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Find Something Tonight
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
