"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export interface DateHistoryEntry {
  id: string;
  user_id: string;
  idea_id: string;
  rating: number | null;
  note: string | null;
  completed_at: string;
  created_at: string;
}

export function useDateHistory(ideaId?: string) {
  const { user } = useAuth();
  const [entry, setEntry] = useState<DateHistoryEntry | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if this specific idea has been completed
  useEffect(() => {
    if (!user || !ideaId) {
      setEntry(null);
      return;
    }

    supabase
      .from("date_history")
      .select("*")
      .eq("user_id", user.id)
      .eq("idea_id", ideaId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setEntry(data as DateHistoryEntry | null);
      });
  }, [user, ideaId]);

  const markCompleted = useCallback(
    async (rating: number, note?: string): Promise<boolean> => {
      if (!user || !ideaId) return false;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("date_history")
          .insert({
            user_id: user.id,
            idea_id: ideaId,
            rating,
            note: note || null,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        setEntry(data as DateHistoryEntry);
        return true;
      } catch (err) {
        console.error("Failed to log date:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, ideaId]
  );

  const updateEntry = useCallback(
    async (rating: number, note?: string): Promise<boolean> => {
      if (!user || !entry) return false;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("date_history")
          .update({ rating, note: note || null })
          .eq("id", entry.id)
          .select()
          .single();

        if (error) throw error;
        setEntry(data as DateHistoryEntry);
        return true;
      } catch (err) {
        console.error("Failed to update:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, entry]
  );

  const removeEntry = useCallback(async (): Promise<boolean> => {
    if (!user || !entry) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("date_history")
        .delete()
        .eq("id", entry.id);

      if (error) throw error;
      setEntry(null);
      return true;
    } catch (err) {
      console.error("Failed to remove:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, entry]);

  return {
    entry,
    isCompleted: !!entry,
    loading,
    markCompleted,
    updateEntry,
    removeEntry,
  };
}

// Hook for fetching ALL history entries (for the history page)
export function useAllDateHistory() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DateHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedIdeaIds, setCompletedIdeaIds] = useState<Set<string>>(
    new Set()
  );

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setCompletedIdeaIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("date_history")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (!error && data) {
      setEntries(data as DateHistoryEntry[]);
      setCompletedIdeaIds(new Set(data.map((e) => e.idea_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { entries, loading, completedIdeaIds, refetch: fetchHistory };
}
