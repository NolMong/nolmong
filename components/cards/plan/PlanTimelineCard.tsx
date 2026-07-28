"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TimelineLeft from "./TimelineLeft";
import PlanCardHeader from "./PlanCardHeader";
import PlanCardBody from "./PlanCardBody";
import type { PlanCardData } from "@/types/plans";
import { usePlanStore } from "@/store/usePlanStore";
import { addEditingCard, removeEditingCard } from "@/lib/ably/planPresence";
import { getEditorsLabel, useCardEditors } from "@/hooks/useCardEditors";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false },
);

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
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      clearNewCard();
    }
  }, []);

  // 이 카드를 편집 중인 다른 참여자 (본인 탭 제외)
  const editors = useCardEditors(data.id);

  // 편집 중인 카드를 다른 참여자에게 알림 (presence).
  // 편집 종료(저장/취소/DnD 전환)뿐 아니라 언마운트(카드 삭제, 페이지 이동)에도
  // cleanup이 실행되므로 "수정 중" 표시가 남지 않는다.
  useEffect(() => {
    if (!isEditing) return;
    addEditingCard(data.id);
    return () => removeEditingCard(data.id);
  }, [isEditing, data.id]);

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

  // 체크박스 토글
  const toggleCheck = (id: string) => {
    // 편집 중에는 로컬 편집본만 바꾸고 "확인" 시점에 저장한다
    if (isEditing) {
      setChecklists((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item,
        ),
      );
      return;
    }

    // 조회 모드의 체크박스는 편집 폼이 아니라 즉시 반영되는 조작으로 취급한다.
    // 최신 data를 기준으로 갱신해 저장하면 Ably 전파 → data 갱신 → 화면 반영으로 이어진다.
    const updatedItems = (data.checklistItems || []).map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item,
    );
    onUpdate?.({ ...data, checklistItems: updatedItems });
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

  // 편집을 열 때마다 폼을 최신 data로 업데이트
  const handleEditStart = () => {
    setEditStartTime(data.times?.[0] || "");
    setEditEndTime(data.times?.[1] || "");
    setEditCost(data.expense !== undefined ? String(data.expense) : "");
    setEditMemo(data.desc || "");
    setChecklists(data.checklistItems || []);
    setIsEditing(true);
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

  const handleDelete = () => {
    // 방금 추가한(저장 전) 카드는 삭제 시 로컬에서만 제거
    if (isDraft) {
      discardCard(data.id);
      return;
    }
    onDelete?.(data.id);
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

      <div className={cn("flex-1", isDnd ? "pb-2.5" : "pb-6")}>
        <div
          {...(isDnd ? { ...attributes, ...listeners } : {})}
          className={cn(
            "px-5 py-4 bg-white rounded-lg shadow-card flex flex-col",
            isDnd && "cursor-grab active:cursor-grabbing",
          )}
        >
          <PlanCardHeader
            data={data}
            isEditing={isEditing}
            isDnd={isDnd}
            onEditStart={handleEditStart}
            onDelete={handleDelete}
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

          {editors.length > 0 && (
            <div className="flex items-center justify-end mt-2 gap-1">
              <Player
                autoplay
                loop
                src="/lottie/loading.json"
                className="[&_svg]:scale-[3.5] [&_svg]:transform-gpu overflow-visible"
                style={{ width: "20px", height: "20px" }}
              />
              <span className="text-xs font-regular truncate text-primary-focus">
                {getEditorsLabel(editors)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
