'use client';

import { Tag } from '@/components';
import { X } from 'lucide-react';
import Link from 'next/link';

const WAYPOINTS = (
  <div>
    <span className='font-bold mr-3 text-sub '>Day1</span>
    <span className='mr-2'>제주국제공항</span>
    <span className='mr-2'>제주샴발리5성급호텔</span>
    <span className='mr-2'>감귤농장</span>
    <span className='mr-2'>한라산정상</span>
    <span className='mr-2'>유우우우명한</span>
    <span className='mr-10'>제주고기국수</span>

    <span className='font-bold mr-3 text-sub'>Day2</span>
    <span className='mr-2'>호텔</span>
    <span className='mr-2'>고오오오급 돼지 국밥</span>
    <span className='mr-2'>이쁜 카페</span>
    <span className='mr-2'>끼깔난 점심</span>
    <span className='mr-2'>고급진 카페</span>
    <span className='mr-2'>훌륭한 갈치 조림집</span>
  </div>
);

export default function TravelCard() {
  return (
    <div className='box w-90 rounded-[10px] border-2 border-border overflow-hidden shadow-[0px_4px_10px_0px_#b5b5b540] group hover:border-primary hover:scale-105 transition-all duration-300'>
      {/* 카드 헤더 */}
      <div className='w-full px-3.5 py-2 bg-primary-light flex justify-between'>
        <div className='text-[12px] text-muted'>No. 2026071548375</div>

        <X
          color='var(--color-muted)'
          size={18}
          onClick={() => {
            alert('삭제하시겠습니까?');
          }}
          className='cursor-pointer hover:text-sub'
        ></X>
      </div>
      {/* 카드 몸통 */}
      <div className='w-full px-4 pt-3 pb-2 bg-[#FEFFFD]'>
        {/* 목적지와 누구 */}
        <div className='w-full flex justify-between'>
          <div className='flex gap-3 items-center'>
            <div>
              <div className='font-jalnan-gothic text-main text-[18px]'>
                서울
              </div>
              <div className='text-[10px] text-muted mt-[-2px]'>Seoul</div>
            </div>

            <div className='font-jalnan-gothic text-main text-[18px]'>‣</div>

            <div>
              <div className='font-jalnan-gothic text-main text-[18px]'>
                부산
              </div>
              <div className='text-[10px] text-muted mt-[-2px]'>Busan</div>
            </div>

            <div className='font-jalnan-gothic text-main text-[18px]'>‣</div>

            <div>
              <div className='font-jalnan-gothic text-main text-[18px]'>
                제주도
              </div>
              <div className='text-[10px] text-muted mt-[-2px]'>Jejudo</div>
            </div>
          </div>
          <div>
            <div className='w-6 h-6 rounded-full bg-primary'></div>
          </div>
        </div>
        {/* 가는 날짜 */}
        <div className='flex gap-1.5 text-sm text-main mt-2'>
          <div>2026년 07월 16일</div>
          <div>‣</div>
          <div>07월 19일</div>
        </div>
        {/* 여행 제목 */}
        <div className='mt-4 text-muted'>제주도 힐링 투어</div>
      </div>
      {/* 들르는 장소 */}
      <div className='w-full px-3.5 py-2 bg-primary-light overflow-hidden'>
        <div className='flex w-max group-hover:animate-marquee'>
          <div className='text-[12px] text-muted whitespace-nowrap pr-8'>
            {WAYPOINTS}
          </div>
          <div
            className='text-[12px] text-muted whitespace-nowrap pr-8'
            aria-hidden='true'
          >
            {WAYPOINTS}
          </div>
        </div>
      </div>

      {/* 언제 바꿨는지 & 수정버튼 */}
      <div className='w-full px-3.5 py-1.5 bg-[#FEFFFD] flex items-center justify-between'>
        <div className='text-[12px] text-muted whitespace-nowrap'>
          최근 편집 : 방금 전
        </div>
        <Link href='/main/edit' className='flex gap-1 items-center'>
          <Tag color='primary'>수정</Tag>
        </Link>
      </div>
    </div>
  );
}
