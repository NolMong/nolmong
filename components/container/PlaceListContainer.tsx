'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import CandidatePlaceCard, {
  type CandidatePlaceItem,
} from '../ cards/CandidatePlaceCard';
import { cn } from '@/lib/utils';

interface PlaceListContainerProps {
  places: CandidatePlaceItem[];
  onAddClick?: () => void; // 장소 추가 (+) 버튼 클릭 이벤트
  className?: string;
}

export default function PlaceListContainer({
  places,
  onAddClick,
  className,
}: PlaceListContainerProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 bg-white rounded-xl w-full shadow-card',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        {/* 타이틀 */}
        <h2 className="text-base text-main font-jalnan-gothic">장소 리스트</h2>

        {/* 장소 추가 (+) 버튼 */}
        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-light text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
          aria-label="장소 추가"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {places.map((place) => (
          <CandidatePlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}
