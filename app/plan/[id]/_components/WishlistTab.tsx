'use client';

import { useState } from 'react';
import { DayCard, PlaceListContainer } from '@/components';
import PlaceCard, { PlaceItem } from '@/components/cards/PlaceCard';
import { usePlanStore } from '@/store/usePlanStore';
import { getTripDays } from '@/lib/utils';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
// import { arrayMove } from '@dnd-kit/sortable';
import { useMapModalStore } from '@/store/useModalStore';

export default function WishlistTab() {
  const { cards, start_day, end_day, moveCardToDay, reorderCardsInDay } =
    usePlanStore();
  const [activePlace, setActivePlace] = useState<PlaceItem | null>(null);
  const openMapModal = useMapModalStore((state) => state.open);

  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    container.scrollLeft += e.deltaY;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const tripDays = getTripDays(start_day, end_day);

  // PLACE 카드만 PlaceItem 규격으로 변함
  const getPlaceItemsByDay = (targetDay: string | null): PlaceItem[] => {
    const dayCards = cards
      .filter((c) => c.day === targetDay)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    let placeCounter = 1;
    const placeItems: PlaceItem[] = [];

    dayCards.forEach((card) => {
      if (card.type === 'PLACE') {
        placeItems.push({
          id: card.id,
          name: card.name || '',
          category: card.category || '',
          location: card.address || '',
          orderNumber: targetDay !== null ? placeCounter++ : undefined,
        });
      }
    });

    return placeItems;
  };

  const findContainerDay = (id: string): string | null => {
    if (id === 'candidate-list') return null;
    if (id.startsWith('day-')) return id;

    const card = cards.find((c) => c.id === id);
    return card ? card.day : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    const card = cards.find((c) => c.id === activeId);
    if (card && card.type === 'PLACE') {
      setActivePlace({
        id: card.id,
        name: card.name || '',
        category: card.category || '',
        location: card.address || '',
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlace(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeDay = findContainerDay(activeId);
    const overDay = findContainerDay(overId);

    if (activeDay !== overDay) {
      moveCardToDay(activeId, overDay!);
    } else {
      reorderCardsInDay(activeDay, activeId, overId);
    }
  };

  return (
    <DndContext
      id='plan-dnd-context'
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      autoScroll={{
        // document(페이지 세로 스크롤)가 항상 최우선 후보라 포인터가 화면
        // 위/아래 쪽에 가까우면 Day 행의 가로 오토스크롤보다 먼저 걸려버린다.
        // dnd-kit은 한 번에 컨테이너 하나만 스크롤하므로 document는 후보에서 제외한다.
        canScroll: (element) => element !== document.scrollingElement,
      }}
    >
      <div
        className='flex gap-5 h-120 p-2 overflow-x-auto scrollbar'
        // onWheel={handleWheelScroll}
      >
        {tripDays.map((day) => (
          <DayCard
            key={day.dayId}
            dayId={day.dayId}
            dayNumber={day.dayNumber}
            dateText={day.dateText}
            places={getPlaceItemsByDay(day.dayId)}
          />
        ))}
      </div>

      <div className='mt-5 p-2'>
        <PlaceListContainer
          containerId='candidate-list'
          places={getPlaceItemsByDay('day-0')}
          onAddClick={openMapModal}
        />
      </div>

      <DragOverlay>
        {activePlace ? (
          <PlaceCard place={activePlace} isOverlay />
        ) : (
          <div>장소가 없습니다.</div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
