'use client';

import React from 'react';
import { Clock, CircleDollarSign, SquareMenu } from 'lucide-react';
import type { PlanCardData } from '@/types/plans';

interface PlaceCardProps {
  data: PlanCardData;
  isEditing: boolean;
  editStartTime: string;
  editEndTime: string;
  editCost: string;
  editMemo: string;
  setEditStartTime: (value: string) => void;
  setEditEndTime: (value: string) => void;
  setEditCost: (value: string) => void;
  setEditMemo: (value: string) => void;
}

export default function PlaceCard({
  data,
  isEditing,
  editStartTime,
  editEndTime,
  editCost,
  editMemo,
  setEditStartTime,
  setEditEndTime,
  setEditCost,
  setEditMemo,
}: PlaceCardProps) {
  // times, expense, desc
  const displayTime =
    data.times && data.times.length === 2
      ? `${data.times[0]} ~ ${data.times[1]}`
      : null;
  const displayCost =
    data.expense !== undefined && data.expense !== 0 ? data.expense : null;
  const displayMemo = data.desc;

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 text-xs font-regular text-main mt-3">
        <div className="flex items-center gap-2">
          <Clock size={12} className="shrink-0 text-main" />
          <input
            type="text"
            placeholder="11:00"
            value={editStartTime}
            onChange={(event) => setEditStartTime(event.target.value)}
            className="w-20 rounded-sm border border-border p-1.5 text-left focus:outline-1 focus:outline-muted"
          />
          <span>~</span>
          <input
            type="text"
            placeholder="13:00"
            value={editEndTime}
            onChange={(event) => setEditEndTime(event.target.value)}
            className="w-20 rounded-sm border border-border p-1.5 text-left focus:outline-1 focus:outline-muted"
          />
        </div>
        <div className="flex items-center gap-2">
          <CircleDollarSign size={12} className="shrink-0 text-main" />
          <input
            type="text"
            placeholder="금액을 입력해주세요"
            value={editCost}
            onChange={(event) => setEditCost(event.target.value)}
            className="w-46 rounded-sm border border-border p-1.5 text-left focus:outline-1 focus:outline-muted"
          />
          <span>원</span>
        </div>
        <div className="flex items-start gap-2">
          <SquareMenu size={12} className="shrink-0 text-main" />
          <textarea
            rows={3}
            placeholder="메모를 입력하세요"
            value={editMemo}
            onChange={(event) => setEditMemo(event.target.value)}
            className="flex-1 resize-none rounded-sm border border-border p-1.5 text-left focus:outline-1 focus:outline-muted"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 text-sub mt-2">
      {displayTime && (
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="shrink-0 text-main" />
          <span>{displayTime}</span>
        </div>
      )}
      {displayCost && (
        <div className="flex items-center gap-1.5">
          <CircleDollarSign size={13} className="shrink-0 text-main" />
          <span>{displayCost}</span>
        </div>
      )}
      {displayMemo && (
        <div className="flex items-center gap-1.5">
          <SquareMenu size={13} className="shrink-0 text-main" />
          <span className="whitespace-pre-line">{displayMemo}</span>
        </div>
      )}
    </div>
  );
}
