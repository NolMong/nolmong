'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { MainButton, LoginModal } from '@/components';
import {
  ProfileAvatar,
  ProfileEditModal,
  PlanMemberAvatars,
} from '@/components';
import { useLoginModalStore } from '@/store/useModalStore';
import {
  useUserStore,
  type UserType,
  type ProfileTheme,
} from '@/store/useUserStore';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Suspense, useEffect, useState } from 'react';

const supabase = createClient();

// useSearchParams()는 이 컴포넌트를 감싸는 Suspense 경계가 필요해서
// (프로덕션 빌드 시 정적 페이지에서 필수) Header 본문과 분리했다.
// inviteUuid 계산 + LoginModal에 넘기는 로직 자체는 그대로 유지.
function HeaderLoginModal() {
  const searchParams = useSearchParams();
  const inviteUuid = searchParams?.get('invite');

  return <LoginModal inviteUuid={inviteUuid ?? undefined} />;
}

export default function Header() {
  const pathname = usePathname();

  const openLoginModal = useLoginModalStore((state) => state.open);
  const setProfile = useUserStore((state) => state.setProfile);

  const [user, setUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 현재 plan 페이지인지 확인
  const isPlanPage = pathname?.startsWith('/plan');

  // 테스트 페이지 여부 확인
  const isTestPage =
    pathname === '/travel-test' || pathname?.startsWith('/travel-test');

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

  // Header에서 초대하기 버튼 눌렀을 때 실행되는 커스텀 이벤트 전달
  const handleInviteClick = () => {
    window.dispatchEvent(new CustomEvent('trigger-invite-copy'));
  };

  // 테스트 페이지에서 로고 클릭 시 안내 알림
  const handleLogoClick = (e: React.MouseEvent) => {
    if (isTestPage) {
      e.preventDefault(); // 페이지 이동 방지
      alert('회원가입을 완료하려면 여행 테스트를 마쳐야 합니다.');
    }
  };

  return (
    <div className="w-full h-17.5 border-b border-border bg-white">
      <Suspense fallback={null}>
        <HeaderLoginModal />
      </Suspense>

      {/* 프로필 수정 모달 */}
      {user && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userId={user.id}
        />
      )}

      <div className="w-full min-w-75 max-w-300 h-full mx-auto px-5 flex items-center justify-between">
        {(pathname === '/landing' && !user) ||
        (pathname === '/main' && user) ? (
          // 랜딩+비로그인, 메인+로그인: 이미 있어야 할 곳이라 클릭해도 아무 일도 없음
          <div className="font-jalnan text-2xl">
            <span className="text-primary">Nol</span>
            <span className="text-caramel">Mong</span>
          </div>
        ) : (
          <Link
            href={user ? '/main' : '/landing'}
            onClick={handleLogoClick}
            className="font-jalnan text-2xl cursor-pointer"
          >
            <span className="text-primary">Nol</span>
            <span className="text-caramel">Mong</span>
          </Link>
        )}

        <div className="flex items-center gap-3">
          {!isTestPage && (
            <>
              {user ? (
                // 로그인 상태
                <>
                  {/* 계획 페이지에서만 — 지금 같이 접속 중인 참여자들 */}
                  {isPlanPage && <PlanMemberAvatars className="mr-1" />}
                  <div
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <ProfileAvatar size={40} />
                  </div>
                  {isPlanPage ? (
                    <MainButton variant="fill" onClick={handleInviteClick}>
                      초대하기
                    </MainButton>
                  ) : (
                    <MainButton variant="default" onClick={handleLogout}>
                      로그아웃
                    </MainButton>
                  )}
                </>
              ) : (
                // 비로그인 상태
                <>
                  <MainButton variant="default" onClick={openLoginModal}>
                    로그인
                  </MainButton>
                  <MainButton
                    variant="fill"
                    className="ml-2"
                    onClick={openLoginModal}
                  >
                    회원가입
                  </MainButton>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
