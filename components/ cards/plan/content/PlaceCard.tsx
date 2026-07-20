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
  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 text-xs font-regular text-main">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-main shrink-0" />
          <input
            type="text"
            placeholder="11:00"
            value={editStartTime}
            onChange={(event) => setEditStartTime(event.target.value)}
            className="w-20 p-1.5 border border-border rounded-sm text-left focus:outline-muted focus:outline-1"
          />
          <span>~</span>
          <input
            type="text"
            placeholder="13:00"
            value={editEndTime}
            onChange={(event) => setEditEndTime(event.target.value)}
            className="w-20 p-1.5 border border-border rounded-sm text-left focus:outline-muted focus:outline-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <CircleDollarSign size={12} className="text-main shrink-0" />
          <input
            type="text"
            placeholder="금액을 입력해주세요"
            value={editCost}
            onChange={(event) => setEditCost(event.target.value)}
            className="w-46 p-1.5 border border-border rounded-sm text-left focus:outline-muted focus:outline-1"
          />
          <span>원</span>
        </div>
        <div className="flex items-start gap-2">
          <SquareMenu size={12} className="text-main shrink-0" />
          <textarea
            rows={3}
            placeholder="메모를 입력하세요"
            value={editMemo}
            onChange={(event) => setEditMemo(event.target.value)}
            className="flex-1 p-1.5 border border-border rounded-sm text-left focus:outline-muted focus:outline-1 resize-none"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 pt-1 text-sub">
      {data.visitTime && (
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-main shrink-0" />
          <span>{data.visitTime}</span>
        </div>
      )}
      {data.cost && (
        <div className="flex items-center gap-1.5">
          <CircleDollarSign size={13} className="text-main shrink-0" />
          <span>{data.cost}</span>
        </div>
      )}
      {data.memo && (
        <div className="flex items-start gap-1.5">
          <SquareMenu size={13} className="text-main shrink-0" />
          <span className="whitespace-pre-line">{data.memo}</span>
        </div>
      )}
    </div>
  );
}
