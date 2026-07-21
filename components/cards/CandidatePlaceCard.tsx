'use client';

import React from 'react';
import { GripVertical, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CandidatePlaceItem {
  id: string;
  name: string;
  category: string;
  location: string;
}

interface CandidatePlaceCardProps {
  place: CandidatePlaceItem;
  className?: string;
}

export default function CandidatePlaceCard({
  place,
  className,
}: CandidatePlaceCardProps) {
  return (
    <div
      className={cn(
        // flex-shrink-0 으로 스크롤 시 카드가 구겨지지 않도록 함
        'flex items-center gap-2 px-2 py-4 bg-white border border-border rounded-lg select-none shrink-0 w-full max-w-55',
        className,
      )}
    >
      {/* 드래그 아이콘 */}
      <div className="cursor-grab text-muted hover:text-sub transition-colors">
        <GripVertical size={12} />
      </div>

      {/* 장소 정보 */}
      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
        {/* 장소 이름 */}
        <h3 className="font-regular text-main text-sm font-jalnan-gothic truncate">
          {place.name}
        </h3>

        {/* 카테고리 및 위치 */}
        <div className="flex items-center gap-1">
          <Tag size={12} className="shrink-0 text-muted" />
          <p className="text-xs text-muted font-regular truncate">
            {place.category} · {place.location}
          </p>
        </div>
      </div>
    </div>
  );
}
