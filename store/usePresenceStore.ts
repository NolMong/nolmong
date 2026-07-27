import { create } from "zustand";
import { PlanPresenceMember } from "@/types/presence";

interface PresenceState {
  // 현재 계획 채널에 접속해 있는 참여자 목록 (본인 포함)
  members: PlanPresenceMember[];

  setMembers: (members: PlanPresenceMember[]) => void;
  clearMembers: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  members: [],

  setMembers: (members) => set({ members }),
  clearMembers: () => set({ members: [] }),
}));
