"use client";

import { useEffect, useRef } from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { createClient } from "@/lib/supabase/client";

export function useAutoSavePlan(uuid: string) {
  const cards = usePlanStore((state) => state.cards);
  const isDirty = usePlanStore((state) => state.isDirty);
  const resetIsDirty = usePlanStore((state) => state.resetIsDirty);

  const cardsRef = useRef(cards);
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    cardsRef.current = cards;
    isDirtyRef.current = isDirty;
  }, [cards, isDirty]);

  const saveToDatabase = async () => {
    if (!isDirtyRef.current) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("plans")
        .update({ cards: cardsRef.current })
        .eq("uuid", uuid);

      if (!error) {
        resetIsDirty();
      }
    } catch (err) {
      console.error("자동 저장 실패:", err);
    }
  };

  useEffect(() => {
    // 3분마다 자동 저장
    const intervalId = setInterval(saveToDatabase, 3 * 60 * 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveToDatabase();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      saveToDatabase();
    };
  }, [uuid]);
}
