'use client';

import React from 'react';
import { GripVertical, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface PlaceItem {
  id: string;
  orderNumber?: number;
  name: string;
  category: string;
  location: string;
}

interface PlaceCardProps {
  place: PlaceItem;
  className?: string;
  isOverlay?: boolean;
}

export default function PlaceCard({ place, className }: PlaceCardProps) {
  // dnd sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // 드래그 중인 카드는 반투명 처리
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 px-1 py-3 bg-white border border-border rounded-lg select-none',
        className,
      )}
    >
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted hover:text-sub transition-colors"
      >
        <GripVertical size={12} />
      </div>

      {/* 장소 정보 구역 */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        {/* 상단: 순번 동그라미 + 장소 이름 */}
        <div className="flex items-center gap-2">
          {/* 순번 배지-orderNumber가 있을 때만 */}
          {place.orderNumber !== undefined && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[8px] font-jalnan pt-1 shrink-0 mb-1">
              {place.orderNumber}
            </span>
          )}

          <h3 className="font-regular text-main text-sm font-jalnan-gothic truncate">
            {place.name}
          </h3>
        </div>

        {/* 카테고리 & 위치 */}
        <div
          className={cn(
            'flex items-center gap-1 transition-all',
            place.orderNumber !== undefined ? 'pl-6' : 'pl-0',
          )}
        >
          <Tag size={12} className="shrink-0 text-muted" />
          <span className="text-xs text-muted font-medium truncate">
            {place.category} · {place.location}
          </span>
        </div>
      </div>
    </div>
  );
}
