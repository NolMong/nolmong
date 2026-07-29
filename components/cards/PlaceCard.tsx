"use client";

import React, { useState } from "react";
import { GripVertical, PlayCircle, Tag, X } from "lucide-react";
import { FilterButton } from "@/components";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePlanStore } from "@/store/usePlanStore";

export interface PlaceItem {
  id: string;
  orderNumber?: number;
  name: string;
  category: string;
  location: string;
}

interface PlaceCardProps {
  place: PlaceItem;
  className?: string;
  isOverlay?: boolean;
  isModal?: boolean;
}

// 가고 싶은 곳에서 사용하는 카드

export default function PlaceCard({
  place,
  className,
  isOverlay,
  isModal,
}: PlaceCardProps) {
  // dnd sortable hook
  // console.log('place : ', place);
  const { deleteCard } = usePlanStore();
  const [selectedOption, setSelectedOption] = useState<string | null>("미정");
  const options = ["미정", "Day1", "Day2", "Day3", "Day4"];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // 드래그 중인 카드는 반투명 처리
  };

  // const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
  //   const container = e.currentTarget;
  //   container.scrollLeft += e.deltaY;
  // };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 px-1 py-3 bg-white border border-border rounded-lg select-none",
        className,
      )}
    >
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted hover:text-sub transition-colors"
      >
        <GripVertical size={16} />
      </div>

      {/* 장소 정보 구역 */}
      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
        {/* 상단: 순번 동그라미 + 장소 이름 */}
        <div className="flex items-center justify-between gap-2.5">
          {/* 순번 배지-orderNumber가 있을 때만 */}
          {place.orderNumber !== undefined && (
            <div className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-primary text-white text-[10px] font-jalnan shrink-0">
              {place.orderNumber}
            </div>
          )}

          <h3 className="w-full font-regular text-main text-sm font-jalnan-gothic truncate">
            {place.name}
          </h3>
          <X
            size={16}
            color="var(--color-muted)"
            className="shrink-0 cursor-pointer hover:text-sub transition-colors mr-0.5"
            onClick={() => {
              // console.log('DEBUG X clicked, deleting id:', place.id);
              deleteCard(place.id);
            }}
          />
        </div>

        {/* 카테고리 & 위치 */}
        <div
          className={cn(
            "flex items-center gap-1 transition-all",
            place.orderNumber !== undefined ? "pl-6" : "pl-0",
          )}
        >
          <Tag size={12} className="shrink-0 text-muted" />
          <span className="text-xs text-muted font-medium truncate">
            {place.category} · {place.location}
          </span>
        </div>

        {isModal && (
          <div
            // onWheel={handleWheelScroll}
            className="flex flex-1 min-w-0 gap-1 overflow-x-auto scrollbar-thin mt-1.5 "
          >
            {options.map((option, index) => (
              <FilterButton
                key={index}
                isActive={selectedOption === option}
                onClick={() => setSelectedOption(option)}
                style={{ flexShrink: 0 }}
              >
                {option}
              </FilterButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
