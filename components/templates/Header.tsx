'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MainButton, LoginModal } from '@/components';
import { useLoginModalStore } from '@/store/useModalStore';

export default function Header() {
  const pathname = usePathname();
  const openLoginModal = useLoginModalStore((state) => state.open);
  const isLogin = true;
  const isMain = pathname === '/main';

  return (
    <div className='w-full h-17.5 border-b border-border bg-white'>
      <LoginModal />
      <div className='w-full min-w-75 max-w-300 h-full mx-auto px-5 flex items-center justify-between'>
        {pathname === '/landing' ? (
          <div className='font-jalnan text-2xl'>
            <span className='text-primary'>Nol</span>
            <span className='text-caramel'>Mong</span>
          </div>
        ) : (
          <Link href='/' className='font-jalnan text-2xl'>
            <span className='text-primary'>Nol</span>
            <span className='text-caramel'>Mong</span>
          </Link>
        )}

        <div>
          <MainButton variant='default' onClick={openLoginModal}>
            로그인
          </MainButton>
          <MainButton variant='fill' className='ml-2' onClick={openLoginModal}>
            회원가입
          </MainButton>
        </div>
      </div>
    </div>
  );
}
