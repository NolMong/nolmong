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
  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 text-xs font-regular text-main">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-main shrink-0" />
          <input
            type="text"
            placeholder="00:00"
            value={editStartTime}
            onChange={(event) => setEditStartTime(event.target.value)}
            className="w-20 p-1.5 border border-border rounded-sm text-left focus:outline-muted focus:outline-1"
          />
          <span>~</span>
          <input
            type="text"
            placeholder="00:00"
            value={editEndTime}
            onChange={(event) => setEditEndTime(event.target.value)}
            className="w-20 p-1.5 border border-border rounded-sm text-left focus:outline-muted focus:outline-1"
          />
        </div>
        <div className="flex items-start gap-2">
          <SquareMenu size={12} className="text-main shrink-0 mt-2" />
          <textarea
            rows={3}
            placeholder="메모를 입력해주세요"
            value={editMemo}
            onChange={(event) => setEditMemo(event.target.value)}
            className="flex-1 p-2 border border-border rounded-sm text-left focus:outline-muted focus:outline-1 resize-none"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 text-sub">
      {data.visitTime && (
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-muted shrink-0" />
          <span>{data.visitTime}</span>
        </div>
      )}
      {data.memo && (
        <p className="whitespace-pre-line leading-relaxed font-medium">
          {data.memo}
        </p>
      )}
    </div>
  );
}
