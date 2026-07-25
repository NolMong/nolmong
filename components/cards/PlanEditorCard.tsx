"use client";

import { Cloud, SquareMenu, CheckSquare, Replace } from "lucide-react";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import PlanTimelineCard from "./plan/PlanTimelineCard";
import type { PlanCardData } from "@/types/plans";
import MainButton from "../common/MainButton";

interface PlanEditorCardProps {
  dayNumber: number;
  dateText: string;
  cards: PlanCardData[];
  onAddCard?: (type: "PLACE" | "MEMO" | "CHECKLIST") => void;
  onUpdateCard?: (updated: PlanCardData) => void;
  onDeleteCard?: (id: string) => void;
  // 현재 day 안에서의 순서 변경 (activeId 카드를 overId 위치로)
  onReorderCards?: (activeId: string, overId: string) => void;
}

export default function PlanEditorCard({
  dayNumber,
  dateText,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onReorderCards,
}: PlanEditorCardProps) {
  const [isDnd, setIsDnd] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorderCards?.(active.id as string, over.id as string);
  };
  return (
    <div className="flex flex-col gap-2.5 h-full min-h-0 w-full max-w-107.5 mx-auto bg-white">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1">
          <h2 className="text-base font-medium text-main">Day {dayNumber}</h2>
          <span className="text-xs font-regular text-muted">{dateText}</span>
        </div>
        <Cloud size={18} className="text-muted" />
      </div>

      <div className="flex justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <MainButton
            // 사이즈 변경 있음
            variant={isDnd ? `disabled` : `default`}
            className="p-2.5 text-sm gap-1.5"
            onClick={() => !isDnd && onAddCard && onAddCard("MEMO")}
          >
            <SquareMenu size={14} /> 메모
          </MainButton>
          <MainButton
            // 사이즈 변경 있음
            variant={isDnd ? `disabled` : `default`}
            className="p-2.5 text-sm gap-1.5"
            onClick={() => !isDnd && onAddCard && onAddCard("CHECKLIST")}
          >
            <CheckSquare size={14} /> 체크
          </MainButton>
        </div>

        <div>
          <MainButton
            // 사이즈 변경 있음
            variant={isDnd ? "round" : "roundDefault"}
            onClick={() => setIsDnd((prev) => !prev)}
          >
            <Replace size={14} />
          </MainButton>
        </div>
      </div>
      <div className="flex flex-col flex-1 min-h-0 overflow-y-scroll scrollbar-none [&::-webkit-scrollbar]:hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={cards.map((card) => card.id)}
            strategy={verticalListSortingStrategy}
          >
            {cards.map((card, index) => (
              <PlanTimelineCard
                key={card.id}
                data={card}
                isLast={index === cards.length - 1}
                isDnd={isDnd}
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
