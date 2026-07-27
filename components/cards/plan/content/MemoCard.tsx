'use client';

import React from 'react';
import { Clock, SquareMenu } from 'lucide-react';
import type { PlanCardData } from '@/types/plans';

interface MemoCardProps {
  data: PlanCardData;
  isEditing: boolean;
  editStartTime: string;
  editEndTime: string;
  editMemo: string;
  setEditStartTime: (value: string) => void;
  setEditEndTime: (value: string) => void;
  setEditMemo: (value: string) => void;
}

export default function MemoCard({
  data,
  isEditing,
  editStartTime,
  editEndTime,
  editMemo,
  setEditStartTime,
  setEditEndTime,
  setEditMemo,
}: MemoCardProps) {
  // times, desc
  const displayTime =
    data.times && data.times.length === 2
      ? `${data.times[0]} ~ ${data.times[1]}`
      : null;
  const displayMemo = data.desc;

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 text-xs font-regular text-main mt-3">
        <div className="flex items-center gap-2">
          <Clock size={12} className="shrink-0 text-main" />
          <input
            type="text"
            placeholder="00:00"
            value={editStartTime}
            onChange={(event) => setEditStartTime(event.target.value)}
            className="w-20 rounded-sm border border-border p-1.5 text-left focus:outline-1 focus:outline-muted"
          />
          <span>~</span>
          <input
            type="text"
            placeholder="00:00"
            value={editEndTime}
            onChange={(event) => setEditEndTime(event.target.value)}
            className="w-20 rounded-sm border border-border p-1.5 text-left focus:outline-1 focus:outline-muted"
          />
        </div>
        <div className="flex items-start gap-2">
          <SquareMenu size={12} className="mt-2 shrink-0 text-main" />
          <textarea
            rows={3}
            placeholder="메모를 입력해주세요"
            value={editMemo}
            onChange={(event) => setEditMemo(event.target.value)}
            className="flex-1 resize-none rounded-sm border border-border p-2 text-left focus:outline-1 focus:outline-muted"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 text-sub">
      {displayTime && (
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="shrink-0 text-muted" />
          <span>{displayTime}</span>
        </div>
      )}
      {displayMemo && (
        <p className="whitespace-pre-line font-medium leading-relaxed">
          {displayMemo}
        </p>
      )}
    </div>
  );
}
