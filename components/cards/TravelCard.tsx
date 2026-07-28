'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import { X } from 'lucide-react';
import { Tag, ProfileAvatar } from '@/components';
import { CardType, PlanType } from '@/api/getPlans';
import { deletePlan } from '@/api/deletePlan';
import { MemberProfileList } from '../common/MemberProfileList';
import { getRelativeTime } from '@/utils/getRelativeTime';
import { getRandomInt } from '@/utils/getRandomInt';
import { locations } from '@/data/locations';
import { isPastEndDay } from '@/utils/isPastEndDay';

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
    <div className="flex gap-3 items-start font-jalnan-gothic text-main text-[18px] z-1">
      <div>
        <div>{startLocation}</div>
        <div className="text-[10px] text-muted -mt-1 font-sans">
          {engName(startLocation)}
        </div>
      </div>
      <div>‣</div>
      {endLocations.map((location, index) => (
        <div key={index} className="flex gap-3 items-start">
          <div>
            <div>{location}</div>
            <div className="text-[10px] text-muted -mt-1 font-sans">
              {engName(location)}
            </div>
          </div>
          {index < endLocations.length - 1 && <div>‣</div>}
        </div>
      ))}
    </div>
  );
};

interface TravelCardProps {
  data?: PlanType;
  onLeave?: (planId: number) => void; // 방 나갔을 때 메인페이지 리스트 갱신용 콜백
}

export default function TravelCard({ data, onLeave }: TravelCardProps) {
  console.log(data);

  const [random, setRandom] = useState(() => ({
    top: getRandomInt(64, 70), // 18 ~ 24
    right: getRandomInt(0, 12), // -2 ~ 12
    rotate: getRandomInt(-20, 20), // -60 ~ 60
  }));

  console.log('DEBUG random:', random);

  const renderedWaypoints = useMemo(() => {
    const cards = data?.cards as CardType[] | undefined;
    if (!cards || cards.length === 0) return null;

    // day 별로 그룹화
    const groupedByDay = cards.reduce<Record<string, CardType[]>>(
      (acc, card: CardType) => {
        const dayKey = card.day || 'day-1';
        if (!acc[dayKey]) acc[dayKey] = [];
        acc[dayKey].push(card);
        return acc;
      },
      {},
    );

    // day 키 정렬
    const sortedDays = Object.keys(groupedByDay)
      .filter((dayKey) => dayKey !== 'day-0' && dayKey !== 'day0')
      .sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
        return numA - numB;
      });

    if (sortedDays.length === 0) return null;

    return (
      <div className="inline-flex items-center">
        {sortedDays.map((dayKey) => {
          // 일자 내에서 order 순으로 정렬
          const dayCards = [...groupedByDay[dayKey]].sort(
            (a: CardType, b: CardType) => (a.order || 0) - (b.order || 0),
          );

          // Day-1 형식으로 변환
          const dayLabel = dayKey
            .replace('day-', 'Day ')
            .replace('day', 'Day ');

          return (
            <div key={dayKey} className="inline-flex items-center mr-6">
              <span className="font-bold mr-4 text-sub">{dayLabel}</span>
              {dayCards.map((card: CardType) => (
                <span key={card.id} className="mr-3">
                  {card.name}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    );
  }, [data]);

  const handleLeavePlan = async () => {
    if (!data) return;

    const confirmLeave = window.confirm(
      `'${data.title || '계획'}' 방에서 나가시겠습니까?\n방에서 나가면 나의 계획 목록에서 제외됩니다.`,
    );

    if (!confirmLeave) return;

    const { error } = await deletePlan(data.id);

    if (error) {
      alert('방에서 나가는 도중 오류가 발생했습니다.');
      return;
    }

    alert('계획에서 나갔습니다.');
    if (onLeave) {
      onLeave(data.id); // 부모에게 나간 plan.id 전달
    }
  };

  const hasValidWaypoints = Boolean(renderedWaypoints);

  return (
    <div className="relative box w-90 rounded-[10px] border-2 border-border overflow-hidden shadow-[0px_4px_10px_0px_#b5b5b540] group hover:border-primary hover:scale-105 transition-all duration-300">
      {/* 카드 헤더 */}
      <div className="w-full px-3.5 py-2 bg-primary-light flex justify-between">
        <div className="text-[12px] text-muted">
          No. {data ? dayjs(data.created_at).format('YYYYMMDDHHmmssms') : ''}
        </div>

        <X
          color="var(--color-muted)"
          size={18}
          onClick={handleLeavePlan}
          className="cursor-pointer hover:text-sub"
        ></X>
      </div>
      {/* 카드 몸통 */}
      <div className="w-full px-4 pt-3 pb-2 bg-[#FEFFFD] z-1">
        {/* 목적지와 누구 */}
        <div className="w-full flex justify-between items-start z-1">
          <Locations
            startLocation={data?.start_location || ''}
            endLocations={data?.end_locations || []}
          ></Locations>

          {/* 프로필 리스트 */}
          <MemberProfileList
            members={data?.members}
            size={28}
            overlapMargin="-ml-3"
          />
        </div>
        {/* 가는 날짜 */}
        <div className="flex gap-1.5 text-sm text-main mt-2">
          <div className="z-1">
            {dayjs(data?.start_day).format('YYYY년 MM월 DD일')}
          </div>
          <div className="z-1">‣</div>
          <div className="z-1">{dayjs(data?.end_day).format('MM월 DD일')}</div>
        </div>
        {/* 여행 제목 */}
        <div className="relative mt-4 text-muted z-1">{data?.title || ''}</div>
      </div>
      {/* 들르는 장소 */}
      <div className="w-full px-3.5 py-2 bg-primary-light overflow-hidden z-1">
        <div className="flex w-max group-hover:animate-marquee">
          <div className="text-[12px] text-muted whitespace-nowrap pr-8">
            {hasValidWaypoints ? renderedWaypoints : '아직 일정이 없습니다.'}
          </div>
          {hasValidWaypoints && (
            <div
              className="text-[12px] text-muted whitespace-nowrap pr-8"
              aria-hidden="true"
            >
              {renderedWaypoints}
            </div>
          )}
        </div>
      </div>

      {/* 언제 바꿨는지 & 수정버튼 */}
      <div className="w-full px-3.5 py-1.5 bg-[#FEFFFD] flex items-center justify-between">
        <div className="text-[12px] text-muted whitespace-nowrap">
          최근 편집 : {data ? getRelativeTime(data.updated_at) : ''}
        </div>
        <Link
          href={`/plan/${data?.uuid}?tab=WISHLIST`}
          className="flex gap-1 items-center"
        >
          <Tag color="primary">수정</Tag>
        </Link>
      </div>
      {isPastEndDay(data?.end_day || new Date()) && (
        <Image
          src="/images/stamp2.png"
          alt="stamp"
          width={200}
          height={200}
          className="absolute w-30 h-30 object-cover object-center opacity-70 z-0"
          style={{
            top: `${random.top}px`,
            right: `${random.right}px`,
            transform: `rotate(${-random.rotate}deg)`,
          }}
        />
      )}
    </div>
  );
}
