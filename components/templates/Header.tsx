'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MainButton, LoginModal } from '@/components';
import { useLoginModalStore } from '@/store/useLoginModalStore';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const supabase = createClient();

export default function Header() {
  const pathname = usePathname();
  const openLoginModal = useLoginModalStore((state) => state.open);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 초기 세션 조회
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    initSession();

    // 실시간 로그인 / 로그아웃 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload(); // 세션 쿠키 완전 초기화를 위해 새로고침
  };

  return (
    <div className="w-full h-17.5 border-b border-border">
      <LoginModal />
      <div className="w-full min-w-75 max-w-300 h-full mx-auto px-5 flex items-center justify-between">
        {pathname === '/landing' ? (
          <div className="font-jalnan text-2xl">
            <span className="text-primary">Nol</span>
            <span className="text-caramel">Mong</span>
          </div>
        ) : (
          <Link href="/" className="font-jalnan text-2xl">
            <span className="text-primary">Nol</span>
            <span className="text-caramel">Mong</span>
          </Link>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            // 로그인 상태
            <>
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border bg-gray-100 flex items-center justify-between">
                <Image
                  src="/images/bara1.webp"
                  alt="프로필 캐릭터"
                  fill
                  sizes="40px"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <MainButton variant="default" onClick={handleLogout}>
                로그아웃
              </MainButton>
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
        </div>
      </div>
    </div>
  );
}
