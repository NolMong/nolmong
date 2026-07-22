'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLoginModalStore } from '@/store/useLoginModalStore';
import { MainButton } from '@/components';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function LoginModal() {
  const isOpen = useLoginModalStore((state) => state.isOpen);
  const close = useLoginModalStore((state) => state.close);
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => {
        setRendered(true);
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }

    const id = requestAnimationFrame(() => setVisible(false));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // 카카오 회원가입
  const handleKakaoSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/main`,
        queryParams: {
          scope: 'profile_nickname',
          prompt: 'login',
        },
      },
    });
    if (error) {
      console.error('카카오 회원가입 실패:', error.message);
    }
  };

  // 카카오 로그인
  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/main`,
        queryParams: {
          scope: 'profile_nickname',
          prompt: 'login',
        },
      },
    });
    if (error) console.error('카카오 로그인 실패:', error.message);
  };

  if (!rendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={close}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && !isOpen) {
          setRendered(false);
        }
      }}
    >
      <div
        className="bg-white p-4 rounded-lg flex flex-col gap-4 w-92 shadow-[0px_4px_10px_0px_#525252]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-jalnan text-[32px] flex items-center justify-center">
          <span className="text-primary">Nol</span>
          <span className="text-caramel">Mong</span>
        </div>
        <div className="flex gap-2.5 align-center items-center">
          <div className="w-full min-w-0 h-px bg-muted"></div>
          <div className="text-muted text-sm shrink-0">로그인</div>
          <div className="w-full min-w-0 h-px bg-muted"></div>
        </div>

        <button
          type="button"
          onClick={handleKakaoLogin}
          className="w-full h-10 relative overflow-hidden rounded-lg cursor-pointer hover:brightness-97"
        >
          <Image
            src="/images/kakao_login.png"
            alt="카카오 로그인"
            fill
            className="object-cover"
            priority
          />
        </button>

        <MainButton
          variant="fill"
          className="font-jalnan"
          width="100%"
          onClick={handleKakaoSignup}
        >
          회원가입
        </MainButton>
      </div>
    </div>
  );
}
