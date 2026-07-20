'use client';

import React from 'react';
import ActionButton from '../../common/ActionButton';
import type { PlanCardData } from '@/types/plans';
import PlanCardEditor from './PlanCardEditor';
import PlanCardView from './PlanCardView';

interface PlanCardContentProps {
  data: PlanCardData;
  isEditing: boolean;
  editStartTime: string;
  editEndTime: string;
  editCost: string;
  editMemo: string;
  checklists: NonNullable<PlanCardData['checklistItems']>;
  setEditStartTime: (value: string) => void;
  setEditEndTime: (value: string) => void;
  setEditCost: (value: string) => void;
  setEditMemo: (value: string) => void;
  onToggleCheck: (id: string) => void;
  onChecklistTextChange: (id: string, text: string) => void;
  onAddChecklistItem: () => void;
  onRemoveChecklistItem: (id: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function PlanCardContent({
  data,
  isEditing,
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
  onCancel,
  onSave,
}: PlanCardContentProps) {
  return (
    <div className="flex flex-col gap-3 text-xs font-regular text-main">
      {isEditing ? (
        <>
          <PlanCardEditor
            data={data}
            editStartTime={editStartTime}
            editEndTime={editEndTime}
            editCost={editCost}
            editMemo={editMemo}
            checklists={checklists}
            setEditStartTime={setEditStartTime}
            setEditEndTime={setEditEndTime}
            setEditCost={setEditCost}
            setEditMemo={setEditMemo}
            onToggleCheck={onToggleCheck}
            onChecklistTextChange={onChecklistTextChange}
            onAddChecklistItem={onAddChecklistItem}
            onRemoveChecklistItem={onRemoveChecklistItem}
          />

          <div className="flex items-center justify-end gap-2 mt-2">
            <ActionButton variant="cancel" onClick={onCancel}>
              취소
            </ActionButton>
            <ActionButton variant="confirm" onClick={onSave}>
              확인
            </ActionButton>
          </div>
        </>
      ) : (
        <PlanCardView
          data={data}
          checklists={checklists}
          onToggleCheck={onToggleCheck}
        />
      )}
    </div>
  );
}
