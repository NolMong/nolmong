'use client';

import React, { useState, useEffect } from 'react';
import { ProfileAvatar, MainButton } from '@/components';
import {
  useUserStore,
  type UserType,
  type ProfileTheme,
} from '@/store/useUserStore';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const CHARACTER_OPTIONS: { type: UserType; name: string }[] = [
  { type: 'capi', name: '카피' },
  { type: 'bara', name: '바라' },
];

const THEME_OPTIONS: { theme: ProfileTheme; name: string }[] = [
  { theme: 'green', name: '초록' },
  { theme: 'pink', name: '분홍' },
  { theme: 'caramel', name: '카라멜' },
  { theme: 'brown', name: '브라운' },
];

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  userId,
}: ProfileEditModalProps) {
  const { userType, profileTheme, setProfile } = useUserStore();

  const [selectedType, setSelectedType] = useState<UserType>(userType);
  const [selectedTheme, setSelectedTheme] =
    useState<ProfileTheme>(profileTheme);
  const [isLoading, setIsLoading] = useState(false);

  // 렌더링 도중 모달 열림 감지 및 상태 동기화
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelectedType(userType);
      setSelectedTheme(profileTheme);
    }
  }

  if (!isOpen) return null;

  // DB 업데이트 및 Zustand Store 저장
  const handleSave = async () => {
    setIsLoading(true);
    const updatedFeatures = [selectedType, selectedTheme];

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ features: updatedFeatures })
        .eq('id', userId);

      if (error) {
        alert('프로필 수정 중 오류가 발생했습니다: ' + error.message);
        return;
      }

      // Zustand Store 업데이트 (전역 컴포넌트에 즉시 반영됨)
      setProfile(selectedType, selectedTheme);
      onClose();
    } catch (err) {
      console.error('프로필 저장 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg flex flex-col items-center gap-6 w-100 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-jalnan text-xl text-brown-light">프로필 수정</div>

        {/* 현재 선택한 프로필 미리보기 */}
        <ProfileAvatar size={80} type={selectedType} theme={selectedTheme} />

        {/* 캐릭터 선택 */}
        <div className="w-full flex flex-col gap-3">
          <span className="text-sm font-medium text-sub">캐릭터 선택</span>
          <div className="flex gap-2">
            {CHARACTER_OPTIONS.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => setSelectedType(item.type)}
                className={`flex-1 py-2 text-sm rounded-lg border font-regular transition-all cursor-pointer ${
                  selectedType === item.type
                    ? 'border-primary bg-primary-light text-primary font-semibold'
                    : 'border-border text-sub hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* 테마 색상 선택 */}
        <div className="w-full flex flex-col gap-3">
          <span className="text-sm font-medium text-sub">테마 색상 선택</span>
          <div className="grid grid-cols-2 gap-2">
            {THEME_OPTIONS.map((item) => (
              <button
                key={item.theme}
                type="button"
                onClick={() => setSelectedTheme(item.theme)}
                className={`flex-1 py-2 text-sm rounded-lg border font-regular transition-all cursor-pointer ${
                  selectedTheme === item.theme
                    ? 'border-primary bg-primary-light text-primary font-semibold'
                    : 'border-border text-sub hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-2 w-full mt-2">
          <MainButton variant="default" className="flex-1" onClick={onClose}>
            취소
          </MainButton>
          <MainButton
            variant="fill"
            className="flex-1"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장하기'}
          </MainButton>
        </div>
      </div>
    </div>
  );
}
