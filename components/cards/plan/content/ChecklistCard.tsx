'use client';

import React from 'react';
import type { PlanCardData } from '@/types/plans';
import Checkbox from '../../../common/Checkbox';
import { X, Plus } from 'lucide-react';

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
  // checklist가 비어있으면 data.checklistItems를 사용
  const itemsToRender = checklists?.length
    ? checklists
    : data.checklistItems || [];

  return (
    <div className="flex flex-col gap-1.5 mt-3">
      {isEditing ? (
        <div className="flex flex-col gap-2">
          {itemsToRender.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox
                checked={item.checked}
                onChange={() => onToggleCheck(item.id)}
                size={18}
              />
              <input
                value={item.text}
                onChange={(event) =>
                  onChecklistTextChange(item.id, event.target.value)
                }
                className="w-full rounded-sm border border-border p-1.5 text-left focus:outline-1 focus:outline-muted"
                placeholder="리스트를 입력해주세요"
              />
              <button
                type="button"
                onClick={() => onRemoveChecklistItem(item.id)}
                className="cursor-pointer text-main"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={onAddChecklistItem}
            className="cursor-pointer bg-border rounded-sm p-1 w-fit text-main"
          >
            <Plus size={12} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 ">
          {itemsToRender.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <Checkbox
                checked={item.checked}
                onChange={() => onToggleCheck(item.id)}
                size={18}
              />
              <span
                className={
                  item.checked ? 'text-muted line-through' : 'text-main'
                }
              >
                {item.text}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
