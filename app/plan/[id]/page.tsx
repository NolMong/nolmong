'use client';

import { use } from 'react';
import { MainButton, MapModal } from '@/components';
import { usePlanTabStore } from '@/store/usePlanTabStore';
import { useAutoSavePlan } from '@/hooks/useAutoSavePlan';
import { LucideEdit3 } from 'lucide-react';
import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import WishlistTab from './_components/WishlistTab';
import PlanDetailsTab from './_components/PlanDetailsTab';
import { useMapModalStore } from '@/store/useModalStore';
import { usePlanSync } from '@/hooks/usePlanSync';
import { usePlanStore } from '@/store/usePlanStore';

export default function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: uuid } = use(params);
  const { activePlanTab, setPlanTab } = usePlanTabStore();
  const { title } = usePlanStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab === 'PLAN_DETAILS' || tab === 'WISHLIST') {
      setPlanTab(tab);
    }
  }, [searchParams, setPlanTab]);

  const handleTabClick = (tab: 'WISHLIST' | 'PLAN_DETAILS') => {
    setPlanTab(tab);

    const nextParams = new URLSearchParams(searchParams?.toString() ?? '');
    nextParams.set('tab', tab);

    router.replace(`${pathname}?${nextParams.toString()}`);
  };

  // console.log(uuid);

  // 주기적 저장 활성화
  useAutoSavePlan(uuid);

  // ably의 uuid 채널을 구독해서 데이터 연동
  usePlanSync(uuid);

  return (
    <main className='relative flex flex-col min-w-300 w-300 mx-auto px-5 pt-8 pb-10'>
      {/* 헤더 타이틀 및 탭 버튼 */}
      <MapModal />
      <div className='flex flex-col gap-5'>
        <div className='flex gap-2'>
          <div className='text-xl font-jalnan-gothic text-sub'>
            {title || '여행'}
          </div>
          <button>
            <LucideEdit3 size={14} className='text-muted' />
          </button>
        </div>

        <div className='flex gap-2 mb-7'>
          <MainButton
            variant={activePlanTab === 'WISHLIST' ? 'lightFill' : 'default'}
            className='py-2 px-4'
            onClick={() => handleTabClick('WISHLIST')}
          >
            가고 싶은 곳
          </MainButton>
          <MainButton
            variant={activePlanTab === 'PLAN_DETAILS' ? 'lightFill' : 'default'}
            className='py-2 px-4'
            onClick={() => handleTabClick('PLAN_DETAILS')}
          >
            상세 계획
          </MainButton>
        </div>
      </div>

      {/* 탭별 뷰 렌더링 */}
      {activePlanTab === 'PLAN_DETAILS' ? <PlanDetailsTab /> : <WishlistTab />}
    </main>
  );
}
