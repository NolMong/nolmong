"use client";

import { Cloud, MapPin, SquareMenu, CheckSquare } from "lucide-react";
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
}

export default function PlanEditorCard({
  dayNumber,
  dateText,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}: PlanEditorCardProps) {
  return (
    <div className="flex flex-col gap-2.5 h-full min-h-0 w-full max-w-107.5 mx-auto bg-white">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1">
          <h2 className="text-base font-medium text-main">Day {dayNumber}</h2>
          <span className="text-xs font-regular text-muted">{dateText}</span>
        </div>
        <Cloud size={18} className="text-muted" />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* <MainButton
          variant="default"
          className="p-2.5 text-sm gap-1.5"
          onClick={() => onAddCard && onAddCard("PLACE")}
        >
          <MapPin size={14} /> 장소
        </MainButton> */}
        <MainButton
          variant="default"
          className="p-2.5 text-sm gap-1.5"
          onClick={() => onAddCard && onAddCard("MEMO")}
        >
          <SquareMenu size={14} /> 메모
        </MainButton>
        <MainButton
          variant="default"
          className="p-2.5 text-sm gap-1.5"
          onClick={() => onAddCard && onAddCard("CHECKLIST")}
        >
          <CheckSquare size={14} /> 체크
        </MainButton>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-y-scroll scrollbar-none [&::-webkit-scrollbar]:hidden">
        {cards.map((card, index) => (
          <PlanTimelineCard
            key={card.id}
            data={card}
            isLast={index === cards.length - 1}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
          />
        ))}
      </div>
    </div>
  );
}
