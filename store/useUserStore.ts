import { create } from 'zustand';

export type UserType = 'KAPI' | 'BALA';
export type ProfileTheme = 'green' | 'red' | 'yellow' | 'gray';

interface UserState {
  userType: UserType;
  profileTheme: ProfileTheme;
  setUserType: (type: UserType) => void;
  setProfileTheme: (theme: ProfileTheme) => void;
  // 두 가지를 한 번에 바꾸는 함수
  setProfile: (type: UserType, theme: ProfileTheme) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userType: 'KAPI', // 기본 캐릭터
  profileTheme: 'green', // 기본 테마 (초록)
  setUserType: (type) => set({ userType: type }),
  setProfileTheme: (theme) => set({ profileTheme: theme }),
  setProfile: (type, theme) => set({ userType: type, profileTheme: theme }),
}));
