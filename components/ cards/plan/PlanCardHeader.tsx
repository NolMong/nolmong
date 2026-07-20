'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import Tag from '../../common/Tag';
import ActionButton from '../../common/ActionButton';
import type { PlanCardData } from '@/types/plans';

interface PlanCardHeaderProps {
  data: PlanCardData;
  isEditing: boolean;
  onEditStart: () => void;
  onDelete?: (id: string) => void;
}

export default function PlanCardHeader({
  data,
  isEditing,
  onEditStart,
  onDelete,
}: PlanCardHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      {data.type === 'CHECKLIST' && <Tag>체크리스트</Tag>}
      {data.type === 'MEMO' && <Tag>메모</Tag>}
      {data.type === 'PLACE' && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-regular text-main font-jalnan-gothic">
            {data.title}
          </h3>
          <p className="text-xs text-muted font-regular">
            {data.category} · {data.location}
          </p>
        </div>
      )}

      {!isEditing ? (
        <button
          type="button"
          onClick={onEditStart}
          className="text-muted hover:text-main transition-colors cursor-pointer"
        >
          <Pencil size={12} />
        </button>
      ) : (
        <ActionButton
          variant="delete"
          onClick={() => onDelete && onDelete(data.id)}
        >
          삭제
        </ActionButton>
      )}
    </div>
  );
}
