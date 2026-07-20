'use client';

import React from 'react';
import type { PlanCardData } from '@/types/plans';
import Checkbox from '../../../common/Checkbox';

interface ChecklistCardProps {
  data: PlanCardData;
  isEditing: boolean;
  checklists: NonNullable<PlanCardData['checklistItems']>;
  onToggleCheck: (id: string) => void;
  onChecklistTextChange: (id: string, text: string) => void;
  onAddChecklistItem: () => void;
  onRemoveChecklistItem: (id: string) => void;
}

export default function ChecklistCard({
  data,
  isEditing,
  checklists,
  onToggleCheck,
  onChecklistTextChange,
  onAddChecklistItem,
  onRemoveChecklistItem,
}: ChecklistCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-xl border border-gray-200 bg-white/70 p-3">
        <div className="mb-2 text-[11px] font-semibold text-main">
          체크리스트
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2">
            {checklists.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Checkbox
                  checked={item.checked}
                  onChange={() => onToggleCheck(item.id)}
                  size={16}
                />
                <input
                  value={item.text}
                  onChange={(event) =>
                    onChecklistTextChange(item.id, event.target.value)
                  }
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs outline-none"
                  placeholder="체크리스트를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => onRemoveChecklistItem(item.id)}
                  className="cursor-pointer text-[11px] text-gray-400 hover:text-red-500"
                >
                  삭제
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={onAddChecklistItem}
              className="cursor-pointer self-start rounded-full border border-dashed border-gray-300 px-3 py-1 text-[11px] text-gray-500 hover:bg-gray-50"
            >
              + 항목 추가
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {checklists.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={item.checked}
                  onChange={() => onToggleCheck(item.id)}
                  size={16}
                />
                <span
                  className={
                    item.checked ? 'text-gray-400 line-through' : 'text-main'
                  }
                >
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {!isEditing && data.memo && (
        <div className="rounded-xl border border-gray-200 bg-white/70 p-3 text-[11px] text-gray-600">
          {data.memo}
        </div>
      )}
    </div>
  );
}
