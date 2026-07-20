'use client';

import React from 'react';
import { Cloud } from 'lucide-react';
import PlaceCard, { type PlaceItem } from './PlaceCard';
import { cn } from '@/lib/utils';

interface DayCardProps {
  dayNumber: number;
  dateText: string;
  places: PlaceItem[];
  className?: string;
}

export default function DayCard({
  dayNumber,
  dateText,
  places,
  className,
}: DayCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 px-3 py-4 bg-white border border-border rounded-xl w-full max-w-[300px] shadow-card',
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
      <div className="flex flex-col gap-2">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}
