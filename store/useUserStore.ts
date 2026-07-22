import { create } from 'zustand';

export type UserType = 'capi' | 'bara';
export type ProfileTheme = 'green' | 'pink' | 'caramel' | 'brown';

interface UserState {
  userType: UserType;
  profileTheme: ProfileTheme;
  setUserType: (type: UserType) => void;
  setProfileTheme: (theme: ProfileTheme) => void;
  // 두 가지를 한 번에 바꾸는 함수
  setProfile: (type: UserType, theme: ProfileTheme) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userType: 'capi', // 기본 캐릭터
  profileTheme: 'green', // 기본 테마 (초록)
  setUserType: (type) => set({ userType: type }),
  setProfileTheme: (theme) => set({ profileTheme: theme }),
  setProfile: (type, theme) => set({ userType: type, profileTheme: theme }),
}));
