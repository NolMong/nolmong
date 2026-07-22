'use client';

import React, { useState } from 'react';
import ProfileAvatar from '../common/ProfileAvatar';
import MainButton from '../common/MainButton';
import {
  useUserStore,
  type UserType,
  type ProfileTheme,
} from '@/store/useUserStore';

const THEME_OPTIONS: { id: ProfileTheme; name: string }[] = [
  { id: 'green', name: '초록' },
  { id: 'pink', name: '핑크' },
  { id: 'caramel', name: '카라멜' },
  { id: 'brown', name: '갈색' },
];

const CHARACTER_OPTIONS: { id: UserType; name: string }[] = [
  { id: 'capi', name: '카피' },
  { id: 'bara', name: '바라' },
];

export default function ProfileEditModal() {
  const { userType, profileTheme, setProfile } = useUserStore();

  // 임시 선택중
  const [selectedType, setSelectedType] = useState<UserType>(userType);
  const [selectedTheme, setSelectedTheme] =
    useState<ProfileTheme>(profileTheme);

  const handleSave = () => {
    // 스토어 업데이트
    setProfile(selectedType, selectedTheme);
    alert('프로필이 성공적으로 변경되었습니다!');
  };

  return (
    <div className="p-6 border border-border rounded-2xl bg-white max-w-md w-full flex flex-col gap-6">
      <h2 className="text-xl font-bold text-main">프로필 수정</h2>

      {/* 현재 선택한 미리보기 */}
      <div className="flex flex-col items-center gap-2 py-4 bg-gray-light/20 rounded-xl">
        <ProfileAvatar size={100} type={selectedType} theme={selectedTheme} />
        <span className="text-xs font-semibold text-sub mt-2">
          선택된 프로필: {selectedType === 'capi' ? '카피' : '바라'} (
          {selectedTheme})
        </span>
      </div>

      {/* 조합 선택 렌더링 */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-bold text-main">
          8가지 프로필 중 선택
        </label>

        <div className="grid grid-cols-4 gap-3">
          {CHARACTER_OPTIONS.map((char) =>
            THEME_OPTIONS.map((thm) => {
              const isSelected =
                selectedType === char.id && selectedTheme === thm.id;
              return (
                <button
                  key={`${char.id}-${thm.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedType(char.id);
                    setSelectedTheme(thm.id);
                  }}
                  className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer hover:opacity-90 ${
                    isSelected
                      ? 'border-primary bg-primary-light/40 scale-105'
                      : 'border-transparent'
                  }`}
                >
                  <ProfileAvatar size={50} type={char.id} theme={thm.id} />
                  <span className="text-[10px] font-medium text-sub mt-1">
                    {char.name} ({thm.name})
                  </span>
                </button>
              );
            }),
          )}
        </div>
      </div>

      <MainButton variant="fill" width="100%" onClick={handleSave}>
        프로필 저장하기
      </MainButton>
    </div>
  );
}
