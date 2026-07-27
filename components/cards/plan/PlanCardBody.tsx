'use client';

import React from 'react';
import PlaceCard from './content/PlaceCard';
import ChecklistCard from './content/ChecklistCard';
import MemoCard from './content/MemoCard';
import Tag from '@/components/common/Tag';
import type { PlanCardData } from '@/types/plans';

interface PlanCardBodyProps {
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

export default function PlanCardBody({
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
}: PlanCardBodyProps) {
  const renderContent = () => {
    if (data.type === 'PLACE') {
      return (
        <PlaceCard
          data={data}
          isEditing={isEditing}
          editStartTime={editStartTime}
          editEndTime={editEndTime}
          editCost={editCost}
          editMemo={editMemo}
          setEditStartTime={setEditStartTime}
          setEditEndTime={setEditEndTime}
          setEditCost={setEditCost}
          setEditMemo={setEditMemo}
        />
      );
    }

    if (data.type === 'CHECKLIST') {
      return (
        <ChecklistCard
          data={data}
          isEditing={isEditing}
          checklists={checklists}
          onToggleCheck={onToggleCheck}
          onChecklistTextChange={onChecklistTextChange}
          onAddChecklistItem={onAddChecklistItem}
          onRemoveChecklistItem={onRemoveChecklistItem}
        />
      );
    }

    return (
      <MemoCard
        data={data}
        isEditing={isEditing}
        editStartTime={editStartTime}
        editEndTime={editEndTime}
        editMemo={editMemo}
        setEditStartTime={setEditStartTime}
        setEditEndTime={setEditEndTime}
        setEditMemo={setEditMemo}
      />
    );
  };

  return (
    <div className="flex flex-col gap-3 text-xs font-regular text-main">
      {renderContent()}

      {/* 수정 중일 때만 하단에 공통 취소/확인 버튼 표시 */}
      {isEditing && (
        <div className="flex items-center justify-end gap-2">
          <Tag color="gray" onClick={onCancel}>
            취소
          </Tag>
          <Tag color="primary" onClick={onSave}>
            확인
          </Tag>
        </div>
      )}
    </div>
  );
}
