"use client";

import React, { useEffect, useRef, useState } from "react";
import TimelineLeft from "./TimelineLeft";
import PlanCardHeader from "./PlanCardHeader";
import PlanCardBody from "./PlanCardBody";
import type { PlanCardData } from "@/types/plans";
import { usePlanStore } from "@/store/usePlanStore";

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
  // 방금 추가된 카드면 바로 편집 모드로 열고, "임시 카드(draft)"로 표시
  const newCardId = usePlanStore((state) => state.newCardId);
  const clearNewCard = usePlanStore((state) => state.clearNewCard);
  const isNew = data.id === newCardId;

  const [isEditing, setIsEditing] = useState(isNew);
  // 저장 전까지는 draft 상태 — 취소 시 카드 자체를 삭제하기 위함
  const [isDraft, setIsDraft] = useState(isNew);

  // 방금 추가된 카드로 내부 스크롤을 이동시키기 위한 ref
  const rootRef = useRef<HTMLDivElement>(null);

  // 마운트 시 표시를 소비해 store를 깨끗이 유지 (isEditing/isDraft는 이미 초기화됨)
  useEffect(() => {
    if (isNew) {
      // 새 카드 위치로 내부 스크롤 이동
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      clearNewCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // times 배열 형태(['12:29', '12:50'])와 visitTime 문자열 형태 둘 다 대응
  const initialStartTime = data.times?.[0] || "";
  const initialEndTime = data.times?.[1] || "";

  // cost, memo
  const initialCost = data.expense !== undefined ? String(data.expense) : "";
  const initialMemo = data.desc || "";

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
      { id: Date.now().toString(), text: "", checked: false },
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
    // 저장하면 더 이상 draft가 아님 (이후 취소해도 삭제되지 않음)
    setIsDraft(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // 방금 추가한(저장 전) 카드는 취소 시 저장하지 않고 삭제
    if (isDraft) {
      onDelete?.(data.id);
      return;
    }
    setIsEditing(false);
  };

  return (
    <div ref={rootRef} className="relative flex gap-4 pl-3 select-none">
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
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
