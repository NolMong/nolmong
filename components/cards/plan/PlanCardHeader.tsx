'use client';

import React from 'react';
import { Edit3 } from 'lucide-react';
import Tag from '../../common/Tag';
import type { PlanCardData } from '@/types/plans';

interface PlanCardHeaderProps {
  data: PlanCardData;
  isEditing: boolean;
  isDnd?: boolean;
  onEditStart: () => void;
  onDelete?: (id: string) => void;
}

export default function PlanCardHeader({
  data,
  isEditing,
  isDnd = false,
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
            {data.name}
          </h3>
          <p className="text-xs text-muted font-regular">
            {data.category} · {data.address}
          </p>
        </div>
      )}

      {/* DnD 모드에서는 수정/삭제 액션을 숨김 */}
      {!isDnd &&
        (!isEditing ? (
          <button
            type="button"
            onClick={onEditStart}
            className="cursor-pointer text-muted transition-colors hover:text-main"
          >
            <Edit3 size={12} />
          </button>
        ) : (
          <Tag color="pink" onClick={() => onDelete && onDelete(data.id)}>
            삭제
          </Tag>
        ))}
    </div>
  );
}
