'use client';

import { PlaceSearchMap, PlaceCard } from '@/components';
import { useState } from 'react';
import { usePlanStore } from '@/store/usePlanStore';
import { loadSavedMapCenter, saveMapCenter } from '@/utils/kakaomap_utils';
import { useMapModalStore } from '@/store/useModalStore';
import { useModal } from '@/hooks/useModal';
import type { PlaceItem } from '@/components/cards/PlaceCard';
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// 후보(장소 리스트) 카드는 day: 'day-0' 예약값으로 표현 (WishlistTab과 동일한 컨벤션)
const CANDIDATE_DAY = 'day-0';

export default function MapModal() {
  const isOpen = useMapModalStore((state) => state.isOpen);
  const closeStore = useMapModalStore((state) => state.close);
  const { rendered, visible, handleTransitionEnd } = useModal(
    isOpen,
    closeStore,
  );

  const { cards, reorderCardsInDay } = usePlanStore();

  // 장소 리스트는 로컬 state가 아니라 cards에서 매번 파생시켜서, Ably로 들어오는
  // 변경(다른 참가자가 추가/삭제한 카드 등)도 그대로 반영되게 한다
  const places: PlaceItem[] = cards
    .filter((c) => c.day === CANDIDATE_DAY && c.type === 'PLACE')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c) => ({
      id: c.id,
      name: c.name || '',
      category: c.category || '',
      location: c.address || '',
    }));

  const [activePlace, setActivePlace] = useState<PlaceItem | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  if (!rendered) return null;

  // MapModal 자신은 plan 페이지에 마운트된 채로 열고 닫힐 때마다 rendered만
  // 토글되고 컴포넌트가 재마운트되지 않아서, useState로 한 번만 읽으면 이후
  // 드래그로 저장한 값이 다음에 열 때 반영되지 않는다. 매번 새로 읽는다
  const savedCenter = loadSavedMapCenter();

  // 화면이 움직일 때마다(드래그, 검색으로 인한 panTo/setBounds, 줌 등) 위치를 저장해서
  // 다음에 열 때도 이어서 보이게 한다. 'dragend'는 사용자가 직접 드래그할 때만 발생해서
  // 검색 결과로 지도가 이동하는 경우를 놓치므로, 모든 이동이 끝났을 때 공통으로 발생하는
  // 'idle'을 쓴다
  const handleMapLoad = (map: kakao.maps.Map) => {
    window.kakao.maps.event.addListener(map, 'idle', () => {
      const center = map.getCenter();
      saveMapCenter({ lat: center.getLat(), lng: center.getLng() });
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    const place = places.find((p) => p.id === activeId);
    if (place) setActivePlace(place);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlace(null);
    if (!over || active.id === over.id) return;

    reorderCardsInDay(CANDIDATE_DAY, active.id as string, over.id as string);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={closeStore}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className='bg-white rounded-lg flex shadow-[0px_4px_10px_0px_#525252] w-fit h-200 overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        <PlaceSearchMap
          className='flex h-full'
          mapAreaClassName='relative w-200 h-full'
          mapClassName='flex-1 h-full'
          center={savedCenter}
          onMapLoad={handleMapLoad}
        />
        <div className='w-70 px-2.5 pt-4 pb-2.5 flex flex-col'>
          <div className='font-jalnan-gothic text-sub w-65 mb-4'>
            장소 리스트
          </div>
          {places.length === 0 ? (
            <div className='flex items-center justify-center h-full text-muted text-sm'>
              장소가 없습니다.
            </div>
          ) : (
            <DndContext
              id='map-modal-place-list-dnd'
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={places.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className='flex flex-col gap-2.5 overflow-y-auto scrollbar-thin'>
                  {places.map((place) => (
                    <PlaceCard key={place.id} place={place} isModal />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activePlace ? (
                  <PlaceCard place={activePlace} isOverlay />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
