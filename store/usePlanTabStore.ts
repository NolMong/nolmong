import { create } from "zustand";

type PlanTab = "WISHLIST" | "PLAN_DETAILS";

interface planTabState {
  activePlanTab: PlanTab;
  setPlanTab: (planTab: PlanTab) => void;
}

export const usePlanTabStore = create<planTabState>((set) => ({
  activePlanTab: "WISHLIST",
  setPlanTab: (planTab) => set({ activePlanTab: planTab }),
}));
