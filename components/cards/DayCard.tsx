'use client';

import React from 'react';
import { Cloud } from 'lucide-react';
import PlaceCard, { type PlaceItem } from './PlaceCard';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface DayCardProps {
  dayId: string; // ex: Day-1
  dayNumber: number;
  dateText: string;
  places: PlaceItem[];
  className?: string;
}

export default function DayCard({
  dayId,
  dayNumber,
  dateText,
  places,
  className,
}: DayCardProps) {
  const { setNodeRef } = useDroppable({ id: dayId });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-4 px-3 py-4 bg-white border border-border rounded-xl w-75 shrink-0 shadow-card',
        className,
      )}
    >
      <div className="flex items-center justify-between px-1">
        {/* Day 표시 + 날씨 아이콘 */}
        <div className="flex items-center gap-1">
          <h2 className="text-base font-medium text-main">Day {dayNumber}</h2>
          <Cloud size={18} className="text-muted" />
        </div>

        {/* 날짜 표시 */}
        <span className="text-base font-medium text-main">{dateText}</span>
      </div>

      {/* 목록 */}
      <SortableContext
        items={places.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 overflow-y-scroll scrollbar-none [&::-webkit-scrollbar]:hidden">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
