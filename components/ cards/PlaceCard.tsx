'use client';

import React from 'react';
import { GripVertical, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PlaceItem {
  id: string;
  orderNumber: number;
  name: string;
  category: string;
  location: string;
}

interface PlaceCardProps {
  place: PlaceItem;
  className?: string;
}

export default function PlaceCard({ place, className }: PlaceCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-1 py-3 bg-white border border-border rounded-2xl select-none',
        className,
      )}
    >
      {/* 드래그 아이콘 */}
      <div className="cursor-grab text-muted hover:text-sub transition-colors">
        <GripVertical size={12} />
      </div>

      {/* 장소 정보 구역 */}
      <div className="flex-1 flex flex-col gap-2">
        {/* 상단: 순번 동그라미 + 장소 이름 */}
        <div className="flex items-center gap-2">
          {/* 순번 배지 */}
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[8px] font-jalnan pt-1 shrink-0 mb-1">
            {place.orderNumber}
          </span>
          <h3 className="font-regular text-main text-sm font-jalnan-gothic">
            {place.name}
          </h3>
        </div>

        {/* 카테고리 & 위치 */}
        <div className="flex items-center gap-1 pl-6">
          <Tag size={12} className="shrink-0 text-muted" />
          <span className="text-xs text-muted font-medium">
            {place.category} · {place.location}
          </span>
        </div>
      </div>
    </div>
  );
}
