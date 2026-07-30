'use client';

import { useEffect, useState } from 'react';
import { FilterGroup, PlanEditorCard, PlaceSearchMap } from '@/components';
import { usePlanStore } from '@/store/usePlanStore';
import { PlanCardData } from '@/types/plans';
import { getTripDays } from '@/lib/utils';

export default function PlanDetailsTab() {
  const [currentDay, setCurrentDay] = useState('day-1');
  const {
    cards,
    start_day,
    end_day,
    updateCard,
    deleteCard,
    addCard,
    reorderCardsInDay,
    clearDrafts,
  } = usePlanStore();

  // 탭을 변경(언마운트) 시, 저장 전 임시 카드(draft)를 정리
  useEffect(() => () => clearDrafts(), [clearDrafts]);

  const tripDays = getTripDays(start_day, end_day);
  const dayOptions = tripDays.map((day) => day.dayId);
  const dateText = tripDays.find((day) => day.dayId === currentDay)?.dateText;

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

  const dayNumber = parseInt(currentDay.replace('day-', ''), 10) || 1;

  const handleNextDay = () => {
    const idx = dayOptions.indexOf(currentDay);
    if (idx >= 0 && idx < dayOptions.length - 1) {
      setCurrentDay(dayOptions[idx + 1]);
    }
  };

  const handlePrevDay = () => {
    const idx = dayOptions.indexOf(currentDay);
    if (idx > 0) {
      setCurrentDay(dayOptions[idx - 1]);
    }
  };

  return (
    <div className='flex gap-5 h-161'>
      <div className='flex flex-col gap-5 h-full min-h-0 w-107.5'>
        <FilterGroup
          options={dayOptions}
          value={currentDay}
          onChange={setCurrentDay}
          scroll={true}
        />
        <PlanEditorCard
          dayNumber={dayNumber}
          dateText={dateText ?? ''}
          cards={filteredCards}
          onUpdateCard={updateCard}
          onDeleteCard={deleteCard}
          onAddCard={(type) => addCard(type, currentDay)}
          onReorderCards={(activeId, overId) =>
            reorderCardsInDay(currentDay, activeId, overId)
          }
          onNextDay={handleNextDay}
          onPrevDay={handlePrevDay}
        />
      </div>

      <PlaceSearchMap
        className='flex flex-1 h-178.5 rounded-lg overflow-hidden -mt-17.5 border border-border'
        mapAreaClassName='relative flex-1'
        mapClassName='flex-1 h-178.5'
        resultsPanelOpenClassName='box shadow-card border-r border-border'
        currentDay={currentDay}
      />
    </div>
  );
}
