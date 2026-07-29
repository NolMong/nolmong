'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FilterGroup,
  PlanEditorCard,
  KakaoMap,
  MainButton,
  SearchResultCard,
  Nothing,
} from '@/components';
import { usePlanStore } from '@/store/usePlanStore';
import { PlanCardData } from '@/types/plans';
import { getTripDays } from '@/lib/utils';
import { Hotel, LocateFixed, MapPin, Newspaper, Search, X } from 'lucide-react';

export default function PlanDetailsTab() {
  const CANDIDATE_DAY = 'day-0';
  const [keyword, setKeyword] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<
    kakao.maps.services.PlacesSearchResultItem[]
  >([]);
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

  const mapRef = useRef<kakao.maps.Map | null>(null);
  const placesServiceRef = useRef<kakao.maps.services.Places | null>(null);
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

  const handleMapLoad = (map: kakao.maps.Map) => {
    mapRef.current = map;
    placesServiceRef.current = new window.kakao.maps.services.Places();
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

  const handleSelectPlace = (
    result: kakao.maps.services.PlacesSearchResultItem,
  ) => {
    if (!mapRef.current) return;
    mapRef.current.panTo(
      new window.kakao.maps.LatLng(Number(result.y), Number(result.x)),
    );
  };

  const moveMapToResults = (
    results: kakao.maps.services.PlacesSearchResultItem[],
  ) => {
    if (!mapRef.current || results.length === 0) return;

    if (results.length === 1) {
      const result = results[0];
      mapRef.current.panTo(
        new window.kakao.maps.LatLng(Number(result.y), Number(result.x)),
      );
      return;
    }

    const bounds = new window.kakao.maps.LatLngBounds();
    results.forEach((result) =>
      bounds.extend(
        new window.kakao.maps.LatLng(Number(result.y), Number(result.x)),
      ),
    );
    mapRef.current.setBounds(bounds);
  };

  const runSearch = (searchKeyword: string) => {
    if (!searchKeyword.trim() || !placesServiceRef.current) return;

    setHasSearched(true);
    placesServiceRef.current.keywordSearch(
      searchKeyword,
      (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setSearchResults(data);
          moveMapToResults(data);
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

      <div className='flex flex-1 h-178.5 rounded-lg overflow-hidden -mt-17.5 border border-border'>
        <div
          className={`flex flex-col h-full overflow-hidden transition-all duration-300 ease-out ${
            hasSearched
              ? 'box w-70 px-2.5 pt-4 pb-2.5 opacity-100 shadow-card border-r border-border'
              : 'w-0 px-0 py-0 opacity-0'
          }`}
        >
          <div className='flex items-center justify-between  mb-4'>
            <div className='font-jalnan-gothic text-sub w-60 text-lg'>
              검색 결과
            </div>
            <X
              size={24}
              className='text-muted cursor-pointer'
              onClick={() => {
                setHasSearched(false);
                setSearchResults([]);
              }}
            />
          </div>
          <div className='w-70 flex flex-col gap-2.5 overflow-y-auto scrollbar-thin flex-1 min-h-0'>
            {searchResults.length === 0 ? (
              <Nothing text='검색 결과가 없습니다.' />
            ) : (
              searchResults.map((result) => (
                <SearchResultCard
                  key={result.id}
                  data={result}
                  onAddPlace={handleAddPlace}
                  onSelect={handleSelectPlace}
                />
              ))
            )}
          </div>
        </div>
        <div className='relative flex-1'>
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
            className='flex-1 h-178.5'
            onMapLoad={handleMapLoad}
            cards={cards}
            currentDay={currentDay}
            markers={markers}
            renderMarkerContent={(marker, closeOverlay) =>
              marker.data ? (
                <SearchResultCard
                  data={marker.data}
                  onAddPlace={(result, day) => {
                    handleAddPlace(result, day);
                    closeOverlay();
                  }}
                  onSelect={handleSelectPlace}
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
      </div>
    </div>
  );
}
