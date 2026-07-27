import { create } from "zustand";
import { PlanPresenceMember } from "@/types/presence";

interface PresenceState {
  // 현재 계획 채널에 접속해 있는 참여자 목록 (본인 포함)
  members: PlanPresenceMember[];
  // 내 식별자. clientId는 해당 탭, userId는 본인 id 단위
  myClientId: string | null;
  myUserId: string | null;

  setMembers: (members: PlanPresenceMember[]) => void;
  setMe: (clientId: string, userId: string) => void;
  clearPresence: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  members: [],
  myClientId: null,
  myUserId: null,

  setMembers: (members) => set({ members }),
  setMe: (clientId, userId) => set({ myClientId: clientId, myUserId: userId }),
  clearPresence: () => set({ members: [], myClientId: null, myUserId: null }),
}));
