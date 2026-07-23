'use client';

import { useEffect, useState } from 'react';
import { getPlans, PlanType } from '@/api/getPlans';
import {
  CalendarComponent,
  CreatePlanModal,
  Tag,
  TravelCard,
} from '@/components';
import { useCreatePlanModalStore } from '@/store/useModalStore';
import Image from 'next/image';

export default function MainPage() {
  const [plans, setPlans] = useState<PlanType[]>([]);
  const openCreatePlanModal = useCreatePlanModalStore((state) => state.open);
  useEffect(() => {
    getPlans().then((res) => {
      if (res.error) {
        console.error('Error fetching plans:', res.error);
      } else {
        console.log('Fetched plans:', res.data);
        setPlans(res.data);
      }
    });
  }, []);

  return (
    <div className=' bg-[#FDFDFD] min-h-screen'>
      <CreatePlanModal />
      <div className='min-w-300 w-300 mx-auto px-5 py-8'>
        {/* 위에 달력 & 새 일정 만드는 버튼 */}
        <div className='flex gap-5 h-fit mb-15'>
          <div className='shrink-0 box w-[384px] px-9 pt-1 rounded-2xl shadow-[0px_4px_10px_0px_#b5b5b540]'>
            <CalendarComponent size='medium' />
            <div className='w-full h-px bg-border mt-2'></div>
            <div className='flex items-center gap-2 py-2 px-2.5'>
              <div className='w-6 h-6 rounded-full bg-primary-light'></div>
              <Tag color='primary'>진행중</Tag>
              <div className='text-xs text-muted h-full'>제주도 힐링 투어</div>
            </div>
          </div>

          <button
            onClick={openCreatePlanModal}
            className='cursor-pointer relative flex-1 self-stretch rounded-2xl shadow-[0px_4px_10px_0px_#b5b5b540] overflow-hidden'
          >
            <Image
              src='/images/landing_bg.webp'
              alt='Main Image'
              fill
              loading='eager'
              className='object-cover object-left'
            />
            <Image
              src='/images/capi1.webp'
              alt='Capi Image'
              width={100}
              height={100}
              className='absolute bottom-[-15%] left-[17%] w-[10%] h-auto -translate-y-1/2'
            />
            <Image
              src='/images/bara1.webp'
              alt='Bara Image'
              width={100}
              height={100}
              className='absolute bottom-[-15%] left-[27%] w-[10%] h-auto -translate-y-1/2'
            />
            <div className='absolute top-5.5 left-8 text-white font-jalnan text-2xl text-left leading-[1.4]'>
              카피, 바라와 함께
              <br />
              여행 계획을 짜볼까요?
            </div>
            <div className='absolute top-24.5 left-8 text-white'>
              친구들을 초대해 실시간으로 계획을 만들고 공유해봐요.
            </div>
            <div className='absolute top-5.5 right-8 bg-[#36B9FD] text-white rounded-full w-50 h-10 text-sm font-bold flex items-center justify-center'>
              새 여행 일정 만들러 가기
            </div>
          </button>
        </div>
        <div className='px-4'>
          <div className='flex items-center gap-1'>
            <div className='text-2xl font-jalnan text-main mr-2'>나의 여행</div>
            <Tag>{plans.length}개</Tag>
          </div>

          <div className='grid grid-cols-3 gap-y-6 py-6 '>
            {plans.map((plan) => (
              <TravelCard key={plan.id} data={plan} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
