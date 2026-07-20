import { create } from 'zustand';

// 유형 정리 - 카피 or 바라
export type UserType = 'KAPI' | 'BALA';

interface UserState {
  userType: UserType;
  setUserType: (type: UserType) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userType: 'KAPI', // 기본값은 카피
  setUserType: (type) => set({ userType: type }),
}));
