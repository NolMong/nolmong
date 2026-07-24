'use client';

import React, { useState } from 'react';
import TimelineLeft from './TimelineLeft';
import PlanCardHeader from './PlanCardHeader';
import PlanCardBody from './PlanCardBody';
import type { PlanCardData } from '@/types/plans';

interface PlanTimelineCardProps {
  data: PlanCardData;
  isLast?: boolean;
  onUpdate?: (updatedData: PlanCardData) => void;
  onDelete?: (id: string) => void;
}

export default function PlanTimelineCard({
  data,
  isLast = false,
  onUpdate,
  onDelete,
}: PlanTimelineCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // times 배열 형태(['12:29', '12:50'])와 visitTime 문자열 형태 둘 다 대응
  const initialStartTime = data.times?.[0] || '';
  const initialEndTime = data.times?.[1] || '';

  // cost, memo
  const initialCost = data.expense !== undefined ? String(data.expense) : '';
  const initialMemo = data.desc || '';

  // State 초기화
  const [editStartTime, setEditStartTime] = useState(initialStartTime);
  const [editEndTime, setEditEndTime] = useState(initialEndTime);
  const [editCost, setEditCost] = useState(initialCost);
  const [editMemo, setEditMemo] = useState(initialMemo);

  // 체크리스트 상태
  const [checklists, setChecklists] = useState(data.checklistItems || []);

  // 조회 모드-체크박스 토글
  const toggleCheck = (id: string) => {
    setChecklists((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  // 수정 모드-체크리스트 항목 텍스트 변경
  const handleChecklistTextChange = (id: string, text: string) => {
    setChecklists((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  };

  // 수정 모드-체크리스트 항목 추가
  const handleAddChecklistItem = () => {
    setChecklists((prev) => [
      ...prev,
      { id: Date.now().toString(), text: '', checked: false },
    ]);
  };

  // 수정 모드-체크리스트 항목 삭제
  const handleRemoveChecklistItem = (id: string) => {
    setChecklists((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    if (onUpdate) {
      const updatedTimes =
        editStartTime && editEndTime
          ? [editStartTime, editEndTime]
          : data.times;

      onUpdate({
        ...data,
        times: updatedTimes,
        expense: editCost ? Number(editCost) : undefined,
        desc: editMemo,
        checklistItems: checklists,
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="relative flex gap-4 pl-3 select-none">
      <TimelineLeft
        isLast={isLast}
        type={data.type}
        placeOrderNumber={data.placeOrderNumber}
      />

      <div className="flex-1 pb-6">
        <div className="px-5 py-4 bg-white rounded-lg shadow-card flex flex-col gap-3">
          <PlanCardHeader
            data={data}
            isEditing={isEditing}
            onEditStart={() => setIsEditing(true)}
            onDelete={onDelete}
          />

          <PlanCardBody
            data={data}
            isEditing={isEditing}
            editStartTime={editStartTime}
            editEndTime={editEndTime}
            editCost={editCost}
            editMemo={editMemo}
            checklists={checklists}
            setEditStartTime={setEditStartTime}
            setEditEndTime={setEditEndTime}
            setEditCost={setEditCost}
            setEditMemo={setEditMemo}
            onToggleCheck={toggleCheck}
            onChecklistTextChange={handleChecklistTextChange}
            onAddChecklistItem={handleAddChecklistItem}
            onRemoveChecklistItem={handleRemoveChecklistItem}
            onCancel={() => setIsEditing(false)}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
