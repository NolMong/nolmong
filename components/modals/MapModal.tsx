'use client';

import React from 'react';
import {
  KakaoMap,
  SearchResultCard,
  PlaceCard,
  MainButton,
} from '@/components';
import { useMemo, useRef, useState } from 'react';
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
import { Search, Hotel, MapPin, Newspaper, LocateFixed } from 'lucide-react';

// 후보(장소 리스트) 카드는 day: 'day-0' 예약값으로 표현 (WishlistTab과 동일한 컨벤션)
const CANDIDATE_DAY = 'day-0';

export default function MapModal() {
  const isOpen = useMapModalStore((state) => state.isOpen);
  const closeStore = useMapModalStore((state) => state.close);
  const { rendered, visible, handleTransitionEnd } = useModal(
    isOpen,
    closeStore,
  );

  const { cards, updateCard, reorderCardsInDay } = usePlanStore();

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

  const mapRef = useRef<kakao.maps.Map | null>(null);
  const placesServiceRef = useRef<kakao.maps.services.Places | null>(null);
  // 최초 렌더에서 한 번만 읽으면 되므로 lazy initializer로 저장된 위치를 불러온다
  // (없으면 undefined -> KakaoMap이 자기 기본값(부산역)을 씀)
  const [savedCenter] = useState(loadSavedMapCenter);
  const [keyword, setKeyword] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<
    kakao.maps.services.PlacesSearchResultItem[]
  >([]);

  const markers = useMemo(
    () =>
      searchResults.map((result) => ({
        id: result.id,
        lat: Number(result.y),
        lng: Number(result.x),
        title: result.place_name,
        address: result.road_address_name || result.address_name,
        data: result,
      })),
    [searchResults],
  );

  if (!rendered) return null;

  const handleMapLoad = (map: kakao.maps.Map) => {
    mapRef.current = map;
    placesServiceRef.current = new window.kakao.maps.services.Places();

    // 사용자가 지도를 옮기면(드래그 끝) 그 위치를 저장해서 다음에 열 때도 이어서 보이게 한다
    window.kakao.maps.event.addListener(map, 'dragend', () => {
      const center = map.getCenter();
      saveMapCenter({ lat: center.getLat(), lng: center.getLng() });
    });
  };

  const runSearch = (searchKeyword: string) => {
    if (!searchKeyword.trim() || !placesServiceRef.current) return;

    setHasSearched(true);
    placesServiceRef.current.keywordSearch(
      searchKeyword,
      (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      },
      mapRef.current ? { location: mapRef.current.getCenter() } : undefined,
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(keyword);
  };

  const handleAddPlace = (
    result: kakao.maps.services.PlacesSearchResultItem,
    day: string = CANDIDATE_DAY,
  ) => {
    const category =
      result.category_name.split(' > ').pop() || result.category_name;

    const dayCards = cards.filter((c) => c.day === day);
    const nextOrder =
      dayCards.reduce((max, c) => Math.max(max, c.order ?? 0), 0) + 1;

    updateCard({
      id: crypto.randomUUID(),
      day,
      order: nextOrder,
      type: 'PLACE',
      name: result.place_name,
      category,
      address: result.road_address_name || result.address_name,
      x: Number(result.x),
      y: Number(result.y),
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
        <div
          className={`flex flex-col h-full overflow-hidden transition-all duration-300 ease-out ${
            hasSearched
              ? 'w-70 px-2.5 pt-4 pb-2.5 opacity-100'
              : 'w-0 px-0 py-0 opacity-0'
          }`}
        >
          <div className='font-jalnan-gothic text-sub w-60 mb-4 shrink-0'>
            검색 결과
          </div>
          <div className='w-70 flex flex-col gap-2.5 overflow-y-auto scrollbar-thin h-full'>
            {searchResults.length === 0 ? (
              <div className='flex items-center justify-center h-full text-muted text-sm'>
                검색 결과가 없습니다.
              </div>
            ) : (
              searchResults.map((result) => (
                <SearchResultCard
                  key={result.id}
                  data={result}
                  onAddPlace={handleAddPlace}
                />
              ))
            )}
          </div>
        </div>

        <div className='relative w-200 h-full '>
          <div className=' w-[calc(100%-20px)] absolute top-2.5 left-2.5 z-10'>
            <form
              onSubmit={handleSearch}
              className='group flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-full border border-border focus-within:border-primary'
            >
              <button type='submit' className='shrink-0'>
                <Search
                  size={24}
                  className='text-muted group-focus-within:text-primary'
                />
              </button>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder='검색'
                className='w-full focus:outline-none'
              />
            </form>
            <div className='flex gap-2 w-66 mt-2.5'>
              <MainButton
                variant='roundDefault'
                style={{ fontSize: '14px', flex: 1, width: 'fit-content' }}
                onClick={() => {
                  setKeyword('맛집');
                  runSearch('맛집');
                }}
              >
                <Hotel
                  size={14}
                  color='var(--color-sub)'
                  style={{ marginRight: '4px' }}
                ></Hotel>
                맛집
              </MainButton>

              <MainButton
                variant='roundDefault'
                style={{ fontSize: '14px', flex: 1, width: 'fit-content' }}
                onClick={() => {
                  setKeyword('카페');
                  runSearch('카페');
                }}
              >
                <MapPin
                  size={14}
                  color='var(--color-sub)'
                  style={{ marginRight: '4px' }}
                ></MapPin>
                카페
              </MainButton>

              <MainButton
                variant='roundDefault'
                style={{ fontSize: '14px', flex: 1, width: 'fit-content' }}
                onClick={() => {
                  setKeyword('관광');
                  runSearch('관광');
                }}
              >
                <Newspaper
                  size={14}
                  color='var(--color-sub)'
                  style={{ marginRight: '4px' }}
                ></Newspaper>
                관광
              </MainButton>
            </div>
          </div>

          <KakaoMap
            className='flex-1 h-full '
            center={savedCenter}
            markers={markers}
            onMapLoad={handleMapLoad}
            renderMarkerContent={(marker) =>
              marker.data ? (
                <SearchResultCard
                  data={marker.data}
                  onAddPlace={handleAddPlace}
                />
              ) : null
            }
          />
          <MainButton
            variant='roundDefault'
            onClick={() => {
              runSearch(keyword);
            }}
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              width: 40,
              height: 40,
              padding: 0,
              zIndex: 50,
            }}
          >
            <LocateFixed size={24} color='var(--color-sub)' />
          </MainButton>
        </div>
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
