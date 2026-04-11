"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export function useSavedIdea(ideaId: string) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      return;
    }

    supabase
      .from("saved_ideas")
      .select("id")
      .eq("user_id", user.id)
      .eq("idea_id", ideaId)
      .maybeSingle()
      .then(({ data }) => {
        setIsSaved(!!data);
      });
  }, [user, ideaId]);

  const toggle = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      if (isSaved) {
        await supabase
          .from("saved_ideas")
          .delete()
          .eq("user_id", user.id)
          .eq("idea_id", ideaId);
        setIsSaved(false);
      } else {
        await supabase
          .from("saved_ideas")
          .insert({ user_id: user.id, idea_id: ideaId });
        setIsSaved(true);
      }
    } finally {
      setLoading(false);
    }
    return true;
  }, [user, ideaId, isSaved]);

  return { isSaved, toggle, loading };
}

// Hook for fetching ALL saved idea IDs (for achievements, etc.)
export function useAllSavedIdeas() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSavedIds([]);
      setLoading(false);
      return;
    }

    supabase
      .from("saved_ideas")
      .select("idea_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setSavedIds((data || []).map((row) => row.idea_id));
        setLoading(false);
      });
  }, [user]);

  return { savedIds, loading };
}
