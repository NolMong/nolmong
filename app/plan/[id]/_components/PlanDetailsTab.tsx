'use client';

import { useState } from 'react';
import { FilterGroup, PlanEditorCard, KakaoMap } from '@/components';
import { PlanCardData } from '@/types/plans';

interface PlanDetailsTabProps {
  cards: PlanCardData[];
  onUpdateCard: (updated: PlanCardData) => void;
  onDeleteCard: (id: string) => void;
}

const dayOptions = ['Day 1', 'Day 2', 'Day 3'];

export default function PlanDetailsTab({
  cards,
  onUpdateCard,
  onDeleteCard,
}: PlanDetailsTabProps) {
  const [currentDay, setCurrentDay] = useState('Day 1');

  return (
    <div className="flex gap-5 h-161">
      <div className="flex flex-col gap-5 h-full min-h-0 w-107.5">
        <FilterGroup
          options={dayOptions}
          value={currentDay}
          onChange={setCurrentDay}
        />
        <PlanEditorCard
          dayNumber={parseInt(currentDay.replace('Day ', ''), 10) || 1}
          dateText="8.8 / 토"
          cards={cards}
          onUpdateCard={onUpdateCard}
          onDeleteCard={onDeleteCard}
        />
      </div>

      <KakaoMap className="flex-1 h-full rounded-xl overflow-hidden border" />
    </div>
  );
}
