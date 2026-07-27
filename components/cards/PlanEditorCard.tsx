'use client';

import { SquareMenu, CheckSquare, Replace } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlanTimelineCard, MainButton, Nothing } from '@/components';
import type { PlanCardData } from '@/types/plans';

interface PlanEditorCardProps {
  dayNumber: number;
  dateText: string;
  cards: PlanCardData[];
  onAddCard?: (type: 'PLACE' | 'MEMO' | 'CHECKLIST') => void;
  onUpdateCard?: (updated: PlanCardData) => void;
  onDeleteCard?: (id: string) => void;
  // 현재 day 안에서의 순서 변경 (activeId 카드를 overId 위치로)
  onReorderCards?: (activeId: string, overId: string) => void;
  // 카드 리스트를 끝까지/처음까지 스크롤한 상태에서 더 스크롤하면 옆 Day로 이동
  onNextDay?: () => void;
  onPrevDay?: () => void;
}

export default function PlanEditorCard({
  dayNumber,
  dateText,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onReorderCards,
  onNextDay,
  onPrevDay,
}: PlanEditorCardProps) {
  const [isDnd, setIsDnd] = useState(false);
  // 짧은 시간 안에 휠 이벤트가 여러 번 들어와도 Day가 한 번에 여러 칸
  // 넘어가지 않도록 마지막 전환 시각을 기억해 잠깐 무시한다
  const lastDayChangeRef = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorderCards?.(active.id as string, over.id as string);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Date.now() - lastDayChangeRef.current < 500) return;

    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 1;
    const atTop = el.scrollTop <= 0;

    if (e.deltaY > 0 && atBottom && onNextDay) {
      lastDayChangeRef.current = Date.now();
      onNextDay();
    } else if (e.deltaY < 0 && atTop && onPrevDay) {
      lastDayChangeRef.current = Date.now();
      onPrevDay();
    }
  };
  return (
    <div className='flex flex-col gap-2.5 h-full min-h-0 w-full max-w-107.5 mx-auto bg-transparent'>
      <div className='flex items-center gap-3 shrink-0'>
        <div className='flex items-center gap-1'>
          <div className='text-md font-medium text-main'>Day {dayNumber}</div>
          <span className='text-xs font-regular text-muted mt-0.5'>
            {dateText}
          </span>
        </div>
        {/* <Cloud size={18} className="text-muted mt-0.5" /> */}
      </div>

      <div className='flex justify-between'>
        <div className='flex items-center gap-2 shrink-0'>
          <MainButton
            // 사이즈 변경 있음
            variant={isDnd ? `disabled` : `default`}
            className='p-2.5 text-sm gap-1.5'
            onClick={() => !isDnd && onAddCard && onAddCard('MEMO')}
          >
            <SquareMenu size={14} /> 메모
          </MainButton>
          <MainButton
            // 사이즈 변경 있음
            variant={isDnd ? `disabled` : `default`}
            className='p-2.5 text-sm gap-1.5'
            onClick={() => !isDnd && onAddCard && onAddCard('CHECKLIST')}
          >
            <CheckSquare size={14} /> 체크
          </MainButton>
        </div>

        <div>
          <MainButton
            // 사이즈 변경 있음
            variant={isDnd ? 'fill' : 'default'}
            onClick={() => setIsDnd((prev) => !prev)}
            style={{
              padding: '10px',
              // border: `1px solid ${isDnd ? 'var(--color-primary)' : 'var(--color-border)'}`,
              // color: isDnd ? 'var(--color-primary)' : 'var(--color-main)',
            }}
            // className={`border border-border ${isDnd ? 'bg-primary text-primary' : 'bg-border text-main'}`}
          >
            <Replace size={20} />
          </MainButton>
        </div>
      </div>
      <div
        className='flex flex-col flex-1 min-h-0 overflow-y-scroll scrollbar-thin pr-1'
        onWheel={handleWheel}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={cards.map((card) => card.id)}
            strategy={verticalListSortingStrategy}
          >
            {cards.length === 0 ? (
              <Nothing text='계획이 없습니다.' height='100%' />
            ) : (
              cards.map((card, index) => (
                <PlanTimelineCard
                  key={card.id}
                  data={card}
                  isLast={index === cards.length - 1}
                  isDnd={isDnd}
                  onUpdate={onUpdateCard}
                  onDelete={onDeleteCard}
                />
              ))
            )}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
