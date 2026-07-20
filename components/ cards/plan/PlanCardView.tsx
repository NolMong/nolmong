'use client';

import React from 'react';
import { Clock, CircleDollarSign, SquareMenu } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlanCardData } from '@/types/plans';
import Checkbox from '../../common/Checkbox';

interface PlanCardViewProps {
  data: PlanCardData;
  checklists: NonNullable<PlanCardData['checklistItems']>;
  onToggleCheck: (id: string) => void;
}

export default function PlanCardView({
  data,
  checklists,
  onToggleCheck,
}: PlanCardViewProps) {
  return (
    <div className="flex flex-col gap-2 text-xs text-main">
      {data.type === 'CHECKLIST' && (
        <div className="flex flex-col gap-1.5">
          {checklists.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox
                checked={!!item.checked}
                onChange={() => onToggleCheck(item.id)}
                size={16}
              />
              <span className={cn(item.checked && 'line-through text-muted')}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.type === 'MEMO' && (
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
      )}

      {data.type === 'PLACE' && (
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
      )}
    </div>
  );
}
