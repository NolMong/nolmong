'use client';

import { Tag } from '@/components';
import { X } from 'lucide-react';
import { PlanType } from '@/api/getPlans';
import { getRelativeTime } from '@/utils/getRelativeTime';
import { locations } from '@/data/locations';
import Link from 'next/link';
import dayjs from 'dayjs';

const WAYPOINTS = (
  <div>
    <span className='font-bold mr-4 text-sub '>Day1</span>
    <span className='mr-3'>제주국제공항</span>
    <span className='mr-3'>제주샴발리5성급호텔</span>
    <span className='mr-3'>감귤농장</span>
    <span className='mr-3'>한라산정상</span>
    <span className='mr-3'>유우우우명한</span>
    <span className='mr-14'>제주고기국수</span>

    <span className='font-bold mr-4 text-sub'>Day2</span>
    <span className='mr-3'>호텔</span>
    <span className='mr-3'>고오오오급 돼지 국밥</span>
    <span className='mr-3'>이쁜 카페</span>
    <span className='mr-3'>끼깔난 점심</span>
    <span className='mr-3'>고급진 카페</span>
    <span className='mr-3'>훌륭한 갈치 조림집</span>
  </div>
);

const Locations = ({
  startLocation,
  endLocations,
}: {
  startLocation: string;
  endLocations: string[];
}) => {
  const engName = (location: string) => {
    const foundLocation = locations.find((loc) =>
      loc.options.find((c) => c.city === location),
    );
    const city = foundLocation?.options.find((c) => c.city === location);
    return city ? city.eng : '';
  };

  return (
    <div className='flex gap-3 items-center font-jalnan-gothic text-main text-[18px]'>
      <div>
        <div>{startLocation}</div>
        <div className='text-[10px] text-muted -mt-1 font-sans'>
          {engName(startLocation)}
        </div>
      </div>
      <div>‣</div>
      {endLocations.map((location, index) => (
        <div key={index} className='flex gap-3 items-center'>
          <div>
            <div>{location}</div>
            <div className='text-[10px] text-muted -mt-1 font-sans'>
              {engName(location)}
            </div>
          </div>
          {index < endLocations.length - 1 && <div>‣</div>}
        </div>
      ))}
    </div>
  );
};

export default function TravelCard({ data }: { data?: PlanType }) {
  console.log(data);
  return (
    <div className='box w-90 rounded-[10px] border-2 border-border overflow-hidden shadow-[0px_4px_10px_0px_#b5b5b540] group hover:border-primary hover:scale-105 transition-all duration-300'>
      {/* 카드 헤더 */}
      <div className='w-full px-3.5 py-2 bg-primary-light flex justify-between'>
        <div className='text-[12px] text-muted'>
          No. {data ? dayjs(data.created_at).format('YYYYMMDDHHmmssms') : ''}
        </div>

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
          <Locations
            startLocation={data?.start_location || ''}
            endLocations={data?.end_locations || []}
          ></Locations>

          <div>
            <div className='w-6 h-6 rounded-full bg-primary'></div>
          </div>
        </div>
        {/* 가는 날짜 */}
        <div className='flex gap-1.5 text-sm text-main mt-2'>
          <div>{dayjs(data?.start_day).format('YYYY년 MM월 DD일')}</div>
          <div>‣</div>
          <div>{dayjs(data?.end_day).format('MM월 DD일')}</div>
        </div>
        {/* 여행 제목 */}
        <div className='mt-4 text-muted'>{data?.title || ''}</div>
      </div>
      {/* 들르는 장소 */}
      <div className='w-full px-3.5 py-2 bg-primary-light overflow-hidden'>
        <div className='flex w-max group-hover:animate-marquee'>
          <div className='text-[12px] text-muted whitespace-nowrap pr-8'>
            {data?.cards.length === 0 ? '아직 일정이 없습니다.' : WAYPOINTS}
            {/* {WAYPOINTS} */}
          </div>
          {/* <div
            className='text-[12px] text-muted whitespace-nowrap pr-8'
            aria-hidden='true'
          >
            {data?.cards.length === 0 ? '아직 일정이 없습니다.' : WAYPOINTS}
          </div> */}
        </div>
      </div>

      {/* 언제 바꿨는지 & 수정버튼 */}
      <div className='w-full px-3.5 py-1.5 bg-[#FEFFFD] flex items-center justify-between'>
        <div className='text-[12px] text-muted whitespace-nowrap'>
          최근 편집 : {data ? getRelativeTime(data.updated_at) : ''}
        </div>
        <Link href={`/plan/${data?.uuid}`} className='flex gap-1 items-center'>
          <Tag color='primary'>수정</Tag>
        </Link>
      </div>
    </div>
  );
}
