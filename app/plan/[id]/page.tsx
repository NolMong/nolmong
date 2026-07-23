'use client';

import { MainButton, MapModal } from '@/components';
import { usePlanTabStore } from '@/store/usePlanTabStore';
import { useAutoSavePlan } from '@/hooks/useAutoSavePlan';
import { LucideEdit3 } from 'lucide-react';

import WishlistTab from './_components/WishlistTab';
import PlanDetailsTab from './_components/PlanDetailsTab';
import { useMapModalStore } from '@/store/useModalStore';

export default function PlanPage() {
  const { activePlanTab, setPlanTab } = usePlanTabStore();

  const planId = '1';

  // 주기적 저장 활성화
  useAutoSavePlan(planId);

  return (
    <main className='relative flex flex-col gap-7.5 min-w-300 w-300 mx-auto px-5 py-8'>
      {/* 헤더 타이틀 및 탭 버튼 */}

      <MapModal />
      <div className='flex flex-col gap-5'>
        <div className='flex gap-2'>
          <div className='text-xl font-jalnan-gothic text-sub'>
            부산 2박 3일 여행
          </div>
          <button>
            <LucideEdit3 size={14} className='text-muted' />
          </button>
        </div>

        <div className='flex gap-2'>
          <MainButton
            variant={activePlanTab === 'WISHLIST' ? 'lightFill' : 'default'}
            className='py-2 px-4'
            onClick={() => setPlanTab('WISHLIST')}
          >
            가고 싶은 곳
          </MainButton>
          <MainButton
            variant={activePlanTab === 'PLAN_DETAILS' ? 'lightFill' : 'default'}
            className='py-2 px-4'
            onClick={() => setPlanTab('PLAN_DETAILS')}
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
