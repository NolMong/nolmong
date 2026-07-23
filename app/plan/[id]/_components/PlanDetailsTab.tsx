'use client';

import { useState } from 'react';
import { FilterGroup, PlanEditorCard, KakaoMap } from '@/components';
import { usePlanStore } from '@/store/usePlanStore';
import { PlanCardData } from '@/types/plans';

const dayOptions = ['Day-1', 'Day-2', 'Day-3'];

export default function PlanDetailsTab() {
  const [currentDay, setCurrentDay] = useState('Day-1');
  const { cards, updateCard, deleteCard } = usePlanStore();

  const dayId = currentDay;

  // 현재 선택된 Day의 카드만 추출 및 정렬
  const rawDayCards = cards
    .filter((card) => card.day === dayId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // PLACE 카드에 순차적 순번 부여
  let placeCounter = 1;
  const filteredCards: PlanCardData[] = rawDayCards.map((card) => {
    if (card.type === 'PLACE') {
      return { ...card, placeOrderNumber: placeCounter++ };
    }
    return card;
  });

  const dayNumber = parseInt(currentDay.replace('Day-', ''), 10) || 1;

  return (
    <div className="flex gap-5 h-161">
      <div className="flex flex-col gap-5 h-full min-h-0 w-107.5">
        <FilterGroup
          options={dayOptions}
          value={currentDay}
          onChange={setCurrentDay}
        />
        <PlanEditorCard
          dayNumber={dayNumber}
          dateText="8.8 / 토"
          cards={filteredCards}
          onUpdateCard={updateCard}
          onDeleteCard={deleteCard}
        />
      </div>

      <KakaoMap className="flex-1 h-full rounded-xl overflow-hidden border" />
    </div>
  );
}
