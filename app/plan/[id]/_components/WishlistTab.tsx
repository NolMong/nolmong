'use client';

import { useState } from 'react';
import { DayCard, PlaceListContainer } from '@/components';
import PlaceCard, { PlaceItem } from '@/components/cards/PlaceCard';
import { usePlanStore } from '@/store/usePlanStore';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export default function WishlistTab() {
  const { cards, moveCardToDay, reorderCardsInDay } = usePlanStore();
  const [activePlace, setActivePlace] = useState<PlaceItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

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
      moveCardToDay(activeId, overDay);
    } else {
      reorderCardsInDay(activeDay, activeId, overId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 h-120 p-2 overflow-x-auto scrollbar-none">
        <DayCard
          dayId="day-1"
          dayNumber={1}
          dateText="8.8 (토)"
          places={getPlaceItemsByDay('day-1')}
        />
        <DayCard
          dayId="day-2"
          dayNumber={2}
          dateText="8.9 (일)"
          places={getPlaceItemsByDay('day-2')}
        />
        <DayCard
          dayId="day-3"
          dayNumber={3}
          dateText="8.10 (월)"
          places={getPlaceItemsByDay('day-3')}
        />
      </div>

      <div className="mt-5 p-2">
        <PlaceListContainer
          containerId="candidate-list"
          places={getPlaceItemsByDay(null)}
        />
      </div>

      <DragOverlay>
        {activePlace ? <PlaceCard place={activePlace} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
