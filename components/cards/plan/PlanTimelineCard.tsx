'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TimelineLeft from './TimelineLeft';
import PlanCardHeader from './PlanCardHeader';
import PlanCardBody from './PlanCardBody';
import type { PlanCardData } from '@/types/plans';
import { usePlanStore } from '@/store/usePlanStore';
import { cn } from '@/lib/utils';

interface PlanTimelineCardProps {
  data: PlanCardData;
  isLast?: boolean;
  isDnd?: boolean;
  onUpdate?: (updatedData: PlanCardData) => void;
  onDelete?: (id: string) => void;
}

export default function PlanTimelineCard({
  data,
  isLast = false,
  isDnd = false,
  onUpdate,
  onDelete,
}: PlanTimelineCardProps) {
  // DnD 모드에서만 활성화되는 정렬 훅
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: data.id, disabled: !isDnd });
  // 방금 추가된 카드면 바로 편집 모드로 열고, "임시 카드(draft)"로 표시
  const newCardId = usePlanStore((state) => state.newCardId);
  const clearNewCard = usePlanStore((state) => state.clearNewCard);
  const commitCard = usePlanStore((state) => state.commitCard);
  const discardCard = usePlanStore((state) => state.discardCard);
  const isNew = data.id === newCardId;

  const [isEditing, setIsEditing] = useState(isNew);
  // 저장 전까지는 draft 상태 — 취소 시 카드 자체를 삭제하기 위함
  const [isDraft, setIsDraft] = useState(isNew);

  // 방금 추가된 카드로 내부 스크롤을 이동시키기 위한 ref
  const rootRef = useRef<HTMLDivElement | null>(null);

  // 스크롤용 rootRef와 정렬용 setNodeRef를 같은 엘리먼트에 연결
  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    setNodeRef(node);
  };

  // DnD 모드일 때만 정렬 트랜스폼 적용
  const style = isDnd
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }
    : undefined;

  // 마운트 시 표시를 소비해 store를 깨끗이 유지 (isEditing/isDraft는 이미 초기화됨)
  useEffect(() => {
    if (isNew) {
      // 새 카드 위치로 내부 스크롤 이동
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      clearNewCard();
    }
  }, []);

  // DnD 모드로 전환되면 편집/추가 중이던 카드는 모두 취소
  useEffect(() => {
    if (!isDnd) return;
    if (isDraft) {
      discardCard(data.id); // 추가 중(draft)이면 로컬에서 제거
    } else if (isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditing(false); // 수정 중이면 저장하지 않고 편집 종료
    }
  }, [isDnd]);

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
    const updatedTimes =
      editStartTime && editEndTime ? [editStartTime, editEndTime] : data.times;

    const updatedCard: PlanCardData = {
      ...data,
      times: updatedTimes,
      expense: editCost ? Number(editCost) : undefined,
      desc: editMemo,
      checklistItems: checklists,
    };

    if (isDraft) {
      // draft의 첫 저장 — 이 시점에 Ably에 처음 생성 (생성 지연)
      commitCard(updatedCard);
      setIsDraft(false);
    } else {
      onUpdate?.(updatedCard);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    // 방금 추가한(저장 전) 카드는 취소 시 로컬에서만 제거 (Ably에 올린 적 없음)
    if (isDraft) {
      discardCard(data.id);
      return;
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className="relative flex gap-4 pl-3 select-none"
    >
      {/* DnD 모드에서는 타임라인을 숨기고 카드 자체를 드래그 */}
      {!isDnd && (
        <TimelineLeft
          isLast={isLast}
          type={data.type}
          placeOrderNumber={data.placeOrderNumber}
        />
      )}

      <div className={cn('flex-1', isDnd ? 'pb-2.5' : 'pb-6')}>
        <div
          {...(isDnd ? { ...attributes, ...listeners } : {})}
          className={cn(
            'px-5 py-4 bg-white rounded-lg shadow-card flex flex-col',
            isDnd && 'cursor-grab active:cursor-grabbing',
          )}
        >
          <PlanCardHeader
            data={data}
            isEditing={isEditing}
            isDnd={isDnd}
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
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
