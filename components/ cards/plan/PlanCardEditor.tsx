'use client';

import React from 'react';
import { Clock, SquareMenu, CircleDollarSign, Plus, X } from 'lucide-react';
import Checkbox from '../../common/Checkbox';
import type { PlanCardData } from '@/types/plans';

interface PlanCardEditorProps {
  data: PlanCardData;
  editStartTime: string;
  editEndTime: string;
  editCost: string;
  editMemo: string;
  checklists: NonNullable<PlanCardData['checklistItems']>;
  setEditStartTime: (v: string) => void;
  setEditEndTime: (v: string) => void;
  setEditCost: (v: string) => void;
  setEditMemo: (v: string) => void;
  onToggleCheck: (id: string) => void;
  onChecklistTextChange: (id: string, text: string) => void;
  onAddChecklistItem: () => void;
  onRemoveChecklistItem: (id: string) => void;
}

export default function PlanCardEditor({
  data,
  editStartTime,
  editEndTime,
  editCost,
  editMemo,
  checklists,
  setEditStartTime,
  setEditEndTime,
  setEditCost,
  setEditMemo,
  onToggleCheck,
  onChecklistTextChange,
  onAddChecklistItem,
  onRemoveChecklistItem,
}: PlanCardEditorProps) {
  return (
    <div className="flex flex-col gap-3 text-xs font-regular text-main">
      {data.type === 'MEMO' && (
        <>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-main shrink-0" />
            <input
              type="text"
              placeholder="00:00"
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
              className="w-20 p-1.5 border border-border rounded-sm text-left focus:outline-muted focus:outline-1"
            />
            <span>~</span>
            <input
              type="text"
              placeholder="00:00"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
              className="w-20 p-1.5 border border-border rounded-sm text-left focus:outline-muted focus:outline-1"
            />
          </div>
          <div className="flex items-start gap-2">
            <SquareMenu size={12} className="text-main shrink-0 mt-2" />
            <textarea
              rows={3}
              placeholder="메모를 입력해주세요"
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              className="flex-1 p-2 border border-border rounded-sm text-left focus:outline-muted focus:outline-1 resize-none"
            />
          </div>
        </>
      )}

      {data.type === 'CHECKLIST' && (
        <div className="flex flex-col gap-2">
          {checklists.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox
                checked={!!item.checked}
                onChange={() => onToggleCheck(item.id)}
                size={16}
              />
              <input
                type="text"
                placeholder="리스트를 입력해주세요"
                value={item.text}
                onChange={(e) => onChecklistTextChange(item.id, e.target.value)}
                className="flex-1 p-1.5 border border-border rounded-sm focus:outline-muted focus:outline-1"
              />
              <button
                type="button"
                onClick={() => onRemoveChecklistItem(item.id)}
                className="text-muted hover:text-main p-1 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddChecklistItem}
            className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-sub rounded transition-colors mt-1"
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      {data.type === 'PLACE' && (
        <>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-main shrink-0" />
            <input
              type="text"
              placeholder="11:00"
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
              className="w-20 p-1.5 border border-border rounded-sm text-left focus:outline-muted focus:outline-1"
            />
            <span>~</span>
            <input
              type="text"
              placeholder="13:00"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
              className="w-20 p-1.5 border border-border rounded-sm text-left focus:outline-muted focus:outline-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <CircleDollarSign size={12} className="text-main shrink-0" />
            <input
              type="text"
              placeholder="금액을 입력해주세요"
              value={editCost}
              onChange={(e) => setEditCost(e.target.value)}
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
              onChange={(e) => setEditMemo(e.target.value)}
              className="flex-1 p-1.5 border border-border rounded-sm text-left focus:outline-muted focus:outline-1 resize-none"
            />
          </div>
        </>
      )}
    </div>
  );
}
