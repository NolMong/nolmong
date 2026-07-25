'use client';

import { useRef, useState } from 'react';
import { FilterGroup, PlanEditorCard, KakaoMap } from '@/components';
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
  } = usePlanStore();
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const placesServiceRef = useRef<kakao.maps.services.Places | null>(null);
  console.log('getTripDays : ', getTripDays(start_day, end_day));

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

  const handleMapLoad = (map: kakao.maps.Map) => {
    mapRef.current = map;
    placesServiceRef.current = new window.kakao.maps.services.Places();
  };

  return (
    <div className='flex gap-5 h-161'>
      <div className='flex flex-col gap-5 h-full min-h-0 w-107.5'>
        <FilterGroup
          options={dayOptions}
          value={currentDay}
          onChange={setCurrentDay}
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
        />
      </div>

      <KakaoMap
        onMapLoad={handleMapLoad}
        cards={cards}
        currentDay={currentDay}
        className='flex-1 h-full rounded-xl overflow-hidden border'
      />
    </div>
  );
}
