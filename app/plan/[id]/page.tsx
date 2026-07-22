'use client';

import { DayCard, MainButton, PlaceListContainer } from '@/components';
import PlaceCard, { PlaceItem } from '@/components/cards/PlaceCard';
import { usePlanTabStore } from '@/store/usePlanTabStore';
import { PlanCardData } from '@/types/plans';
import { LucideEdit3 } from 'lucide-react';
import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export default function PlanPage() {
  const { activePlanTab, setPlanTab } = usePlanTabStore();

  // 후보 장소 리스트
  const [candidatePlaces, setCandidatePlaces] = useState<PlaceItem[]>([
    {
      id: 'cand-1',
      name: '해운대블루라인파크',
      category: '테마/체험',
      location: '부산 해운대구',
    },
    {
      id: 'cand-2',
      name: '미피스토어 해운대점',
      category: '관광',
      location: '나만의 장소',
    },
    {
      id: 'cand-3',
      name: '국이네 낙지볶음',
      category: '식당',
      location: '부산 수영구',
    },
  ]);

  // Day별 장소 리스트
  const [dayPlaces, setDayPlaces] = useState<Record<string, PlaceItem[]>>({
    'day-1': [
      {
        id: 'p-1',
        orderNumber: 1,
        name: '부산역',
        category: '관광',
        location: '부산 동구',
      },
      {
        id: 'p-2',
        orderNumber: 2,
        name: '톤쇼우 남포점',
        category: '식당',
        location: '부산 남포동',
      },
    ],
    'day-2': [],
    'day-3': [],
  });

  // 드래그 중인 카드
  const [activePlace, setActivePlace] = useState<PlaceItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // 5px 이동 시 드래그 시작
    }),
  );

  // 어떤 컨테이너(Day 또는 후보)에 속해있는지 찾아주는 함수
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

  // Day 카드 내 순번(orderNumber) 재계산 함수
  const recalculateOrder = (places: PlaceItem[]) => {
    return places.map((item, index) => ({
      ...item,
      orderNumber: index + 1,
    }));
  };

  // Drag Start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    const allPlaces = [...candidatePlaces, ...Object.values(dayPlaces).flat()];
    const found = allPlaces.find((p) => p.id === activeId);
    if (found) setActivePlace(found);
  };

  // Drag End (모든 양방향 이동 및 순서 변경 처리)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlace(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    // CASE 1: 후보 리스트 -> Day 카드로 이동
    if (
      activeContainer === 'candidate-list' &&
      overContainer.startsWith('day-')
    ) {
      const itemToMove = candidatePlaces.find((p) => p.id === activeId);
      if (!itemToMove) return;

      // Candidate에서 제거
      setCandidatePlaces((prev) => prev.filter((p) => p.id !== activeId));

      // Day로 추가 및 순번 계산
      setDayPlaces((prev) => {
        const targetList = [...prev[overContainer], itemToMove];
        return {
          ...prev,
          [overContainer]: recalculateOrder(targetList),
        };
      });
      return;
    }

    // CASE 2: Day 카드 -> 후보 리스트로 이동
    if (
      activeContainer.startsWith('day-') &&
      overContainer === 'candidate-list'
    ) {
      const itemToMove = dayPlaces[activeContainer].find(
        (p) => p.id === activeId,
      );
      if (!itemToMove) return;

      // Day에서 제거
      setDayPlaces((prev) => ({
        ...prev,
        [activeContainer]: recalculateOrder(
          prev[activeContainer].filter((p) => p.id !== activeId),
        ),
      }));

      // Candidate로 추가 (orderNumber 제거)
      setCandidatePlaces((prev) => [
        ...prev,
        { ...itemToMove, orderNumber: undefined },
      ]);
      return;
    }

    // CASE 3: Day 카드 -> 다른 Day 카드로 이동
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

    // CASE 4: 같은 Day 카드 내에서 순서 변경
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
    <main className="flex flex-col gap-7.5 min-w-300 w-300 mx-auto px-5 py-8">
      {/* 타이틀 + 메뉴 탭 */}
      <div className="flex flex-col gap-5">
        <div className="flex gap-2">
          <div className="text-xl font-jalnan-gothic text-sub">
            부산 2박 3일 여행
          </div>
          <button>
            <LucideEdit3 size={14} className="text-muted" />
          </button>
        </div>

        <div className="flex gap-2">
          <MainButton
            variant={activePlanTab === 'WISHLIST' ? 'lightFill' : 'default'}
            className="py-2 px-4"
            onClick={() => setPlanTab('WISHLIST')}
          >
            가고 싶은 곳
          </MainButton>
          <MainButton
            variant={activePlanTab === 'PLAN_DETAILS' ? 'lightFill' : 'default'}
            className="py-2 px-4"
            onClick={() => setPlanTab('PLAN_DETAILS')}
          >
            상세 계획
          </MainButton>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 h-117 overflow-x-auto scrollbar-none">
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

        <div className="mt-5">
          <PlaceListContainer
            containerId="candidate-list"
            places={candidatePlaces}
          />
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activePlace ? <PlaceCard place={activePlace} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
