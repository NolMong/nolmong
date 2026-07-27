'use client';

import React from 'react';
import { Nothing } from '@/components';
import { Plus } from 'lucide-react';
import PlaceCard, { type PlaceItem } from '../cards/PlaceCard';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

interface PlaceListContainerProps {
  containerId?: string;
  places: PlaceItem[];
  onAddClick?: () => void;
  className?: string;
}

export default function PlaceListContainer({
  containerId = 'candidate-list',
  places,
  onAddClick,
  className,
}: PlaceListContainerProps) {
  const { setNodeRef } = useDroppable({ id: containerId });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-3 px-4 py-6 bg-white rounded-xl w-full shadow-card',
        className,
      )}
    >
      <div className='flex items-center justify-between'>
        {/* 타이틀 */}
        <h2 className='text-base text-main font-jalnan-gothic'>장소 리스트</h2>

        {/* 장소 추가 (+) 버튼 */}
        <button
          type='button'
          onClick={() => onAddClick?.()}
          className='flex items-center justify-center w-6 h-6 rounded-full bg-primary-light text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer'
          aria-label='장소 추가'
        >
          <Plus size={20} />
        </button>
      </div>

      <SortableContext
        items={places.map((p) => p.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className='flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin min-h-20'>
          {places.length === 0 ? (
            <Nothing text='장소가 없습니다.' />
          ) : (
            places.map((place) => (
              <div key={place.id} className='w-55 shrink-0'>
                <PlaceCard place={place} />
              </div>
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
