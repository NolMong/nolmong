'use client';

import { useState } from 'react';
import { DayCard, PlaceListContainer } from '@/components';
import PlaceCard, { PlaceItem } from '@/components/cards/PlaceCard';
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

interface WishlistTabProps {
  candidatePlaces: PlaceItem[];
  setCandidatePlaces: React.Dispatch<React.SetStateAction<PlaceItem[]>>;
  dayPlaces: Record<string, PlaceItem[]>;
  setDayPlaces: React.Dispatch<
    React.SetStateAction<Record<string, PlaceItem[]>>
  >;
}

export default function WishlistTab({
  candidatePlaces,
  setCandidatePlaces,
  dayPlaces,
  setDayPlaces,
}: WishlistTabProps) {
  const [activePlace, setActivePlace] = useState<PlaceItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const findContainer = (id: string) => {
    if (
      id === 'candidate-list' ||
      candidatePlaces.some((item) => item.id === id)
    ) {
      return 'candidate-list';
    }
    if (id in dayPlaces) return id;

    return Object.keys(dayPlaces).find((key) =>
      dayPlaces[key].some((item) => item.id === id),
    );
  };

  const recalculateOrder = (places: PlaceItem[]) => {
    return places.map((item, index) => ({
      ...item,
      orderNumber: index + 1,
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    const allPlaces = [...candidatePlaces, ...Object.values(dayPlaces).flat()];
    const found = allPlaces.find((p) => p.id === activeId);
    if (found) setActivePlace(found);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlace(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    // 후보 -> Day
    if (
      activeContainer === 'candidate-list' &&
      overContainer.startsWith('day-')
    ) {
      const itemToMove = candidatePlaces.find((p) => p.id === activeId);
      if (!itemToMove) return;

      setCandidatePlaces((prev) => prev.filter((p) => p.id !== activeId));
      setDayPlaces((prev) => ({
        ...prev,
        [overContainer]: recalculateOrder([...prev[overContainer], itemToMove]),
      }));
      return;
    }

    // Day -> 후보
    if (
      activeContainer.startsWith('day-') &&
      overContainer === 'candidate-list'
    ) {
      const itemToMove = dayPlaces[activeContainer].find(
        (p) => p.id === activeId,
      );
      if (!itemToMove) return;

      setDayPlaces((prev) => ({
        ...prev,
        [activeContainer]: recalculateOrder(
          prev[activeContainer].filter((p) => p.id !== activeId),
        ),
      }));
      setCandidatePlaces((prev) => [
        ...prev,
        { ...itemToMove, orderNumber: undefined },
      ]);
      return;
    }

    // Day -> 다른 Day
    if (
      activeContainer.startsWith('day-') &&
      overContainer.startsWith('day-') &&
      activeContainer !== overContainer
    ) {
      const itemToMove = dayPlaces[activeContainer].find(
        (p) => p.id === activeId,
      );
      if (!itemToMove) return;

      setDayPlaces((prev) => ({
        ...prev,
        [activeContainer]: recalculateOrder(
          prev[activeContainer].filter((p) => p.id !== activeId),
        ),
        [overContainer]: recalculateOrder([...prev[overContainer], itemToMove]),
      }));
      return;
    }

    // 같은 Day 내 순서 변경
    if (
      activeContainer === overContainer &&
      activeContainer.startsWith('day-')
    ) {
      const list = dayPlaces[activeContainer];
      const oldIndex = list.findIndex((p) => p.id === activeId);
      const newIndex = list.findIndex((p) => p.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(list, oldIndex, newIndex);
        setDayPlaces((prev) => ({
          ...prev,
          [activeContainer]: recalculateOrder(reordered),
        }));
      }
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
          places={dayPlaces['day-1']}
        />
        <DayCard
          dayId="day-2"
          dayNumber={2}
          dateText="8.9 (일)"
          places={dayPlaces['day-2']}
        />
        <DayCard
          dayId="day-3"
          dayNumber={3}
          dateText="8.10 (월)"
          places={dayPlaces['day-3']}
        />
      </div>

      <div className="mt-5 p-2">
        <PlaceListContainer
          containerId="candidate-list"
          places={candidatePlaces}
        />
      </div>

      <DragOverlay>
        {activePlace ? <PlaceCard place={activePlace} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
