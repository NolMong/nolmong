'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MainButton, LoginModal } from '@/components';
import { ProfileAvatar, ProfileEditModal } from '@/components';
import { useLoginModalStore } from '@/store/useModalStore';
import {
  useUserStore,
  type UserType,
  type ProfileTheme,
} from '@/store/useUserStore';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient();

export default function Header() {
  const pathname = usePathname();
  const openLoginModal = useLoginModalStore((state) => state.open);
  const setProfile = useUserStore((state) => state.setProfile);

  const [user, setUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // DB에서 가져와 Zustand Store에 대입
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('features')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data?.features && Array.isArray(data.features)) {
      const [type, theme] = data.features;
      if (type && theme) {
        setProfile(type as UserType, theme as ProfileTheme);
      }
    }
  };

  useEffect(() => {
    // 초기 세션 조회
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchUserProfile(currentUser.id);
      }
    };

    initSession();

    // 실시간 로그인 / 로그아웃 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchUserProfile(currentUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [setProfile]);

  // 로그아웃 처리
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error.message);
      return;
    }

    setUser(null);

    window.location.href = '/landing';
  };

  return (
    <div className='w-full h-17.5 border-b border-border bg-white'>
      <LoginModal />
      {/* 프로필 수정 모달 */}
      {user && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userId={user.id}
        />
      )}

      <div className='w-full min-w-75 max-w-300 h-full mx-auto px-5 flex items-center justify-between'>
        {(pathname === '/landing' && !user) ||
        (pathname === '/main' && user) ? (
          // 랜딩+비로그인, 메인+로그인: 이미 있어야 할 곳이라 클릭해도 아무 일도 없음
          <div className='font-jalnan text-2xl'>
            <span className='text-primary'>Nol</span>
            <span className='text-caramel'>Mong</span>
          </div>
        ) : (
          <Link
            href={user ? '/main' : '/landing'}
            className='font-jalnan text-2xl cursor-pointer'
          >
            <span className='text-primary'>Nol</span>
            <span className='text-caramel'>Mong</span>
          </Link>
        )}

        <div className='flex items-center gap-3'>
          {user ? (
            // 로그인 상태
            <>
              <div
                className='cursor-pointer hover:opacity-90 transition-opacity'
                onClick={() => setIsEditModalOpen(true)}
              >
                <ProfileAvatar size={40} />
              </div>
              <MainButton variant='default' onClick={handleLogout}>
                로그아웃
              </MainButton>
            </>
          ) : (
            // 비로그인 상태
            <>
              <MainButton variant='default' onClick={openLoginModal}>
                로그인
              </MainButton>
              <MainButton
                variant='fill'
                className='ml-2'
                onClick={openLoginModal}
              >
                회원가입
              </MainButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
