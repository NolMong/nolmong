'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Hotel,
  LocateFixed,
  MapPin,
  Newspaper,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react';
import KakaoMap from './KakaoMap';
import SearchResultCard from './plan/SearchResultCard';
import MainButton from '../common/MainButton';
import Nothing from '../common/Nothing';
import { usePlanStore } from '@/store/usePlanStore';

// 검색해서 추가하는 장소는 항상 '미정(day-0)' 후보로 들어간다 (WishlistTab과 동일 컨벤션)
const CANDIDATE_DAY = 'day-0';

// 검색창 아래 빠른 키워드 버튼들 (아이콘/라벨/검색어만 다르고 구조가 같아서 데이터로 뺌)
const QUICK_FILTERS: { label: string; keyword: string; Icon: LucideIcon }[] = [
  { label: '맛집', keyword: '맛집', Icon: Hotel },
  { label: '카페', keyword: '카페', Icon: MapPin },
  { label: '관광', keyword: '관광', Icon: Newspaper },
];

interface PlaceSearchMapProps {
  /** 결과 패널 + 지도 영역을 감싸는 최상위 wrapper className (호출부마다 배치가 달라 직접 지정) */
  className: string;
  /** 검색창/지도를 담는 영역(relative 포지셔닝 기준) className */
  mapAreaClassName: string;
  /** KakaoMap 자체에 적용할 className (보통 높이) */
  mapClassName: string;
  /** 검색 결과 패널이 열렸을 때 추가로 붙는 className (테두리/그림자 등 배치 컨텍스트에 따라 다름) */
  resultsPanelOpenClassName?: string;
  /** 있으면 KakaoMap에 cards+currentDay를 넘겨 해당 day의 일정 핀/선을 같이 그린다 */
  currentDay?: string;
  /** 지도 초기 중심 좌표 */
  center?: { lat: number; lng: number };
  /** 지도 로드 후 호출부가 추가로 하고 싶은 작업 (예: 드래그 시 중심 저장) */
  onMapLoad?: (map: kakao.maps.Map) => void;
}

// PlanDetailsTab / MapModal이 공통으로 쓰는 "키워드 검색 + 지도 + 검색 결과 패널" 블록.
// 두 곳 다 카카오 장소 검색, 결과로 지도 이동, 마커 클릭 시 카드에서 바로 일정 추가하는
// 동작이 완전히 같아서 여기로 모으고, 레이아웃(높이/테두리/지도 초기 위치 등)만 prop으로 받는다.
export default function PlaceSearchMap({
  className,
  mapAreaClassName,
  mapClassName,
  resultsPanelOpenClassName = '',
  currentDay,
  center,
  onMapLoad,
}: PlaceSearchMapProps) {
  const { cards, updateCard } = usePlanStore();

  const [keyword, setKeyword] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<
    kakao.maps.services.PlacesSearchResultItem[]
  >([]);

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

  const handleMapLoad = (map: kakao.maps.Map) => {
    mapRef.current = map;
    placesServiceRef.current = new window.kakao.maps.services.Places();
    onMapLoad?.(map);
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
    <div className={className}>
      <div
        className={`flex flex-col h-full overflow-hidden transition-all duration-300 ease-out ${
          hasSearched
            ? `w-70 px-2.5 pt-4 pb-2.5 opacity-100 ${resultsPanelOpenClassName}`
            : 'w-0 px-0 py-0 opacity-0'
        }`}
      >
        <div className='flex items-center justify-between mb-4'>
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

      <div className={mapAreaClassName}>
        <div className='w-[calc(100%-20px)] absolute top-2.5 left-2.5 z-10'>
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
            {QUICK_FILTERS.map(({ label, keyword: filterKeyword, Icon }) => (
              <MainButton
                key={label}
                variant='roundDefault'
                style={{ fontSize: '14px', flex: 1, width: 'fit-content' }}
                onClick={() => {
                  setKeyword(filterKeyword);
                  runSearch(filterKeyword);
                }}
              >
                <Icon
                  size={14}
                  color='var(--color-sub)'
                  style={{ marginRight: '4px' }}
                />
                {label}
              </MainButton>
            ))}
          </div>
        </div>

        <KakaoMap
          className={mapClassName}
          center={center}
          onMapLoad={handleMapLoad}
          cards={currentDay ? cards : undefined}
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
          onClick={() => runSearch(keyword)}
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
  );
}
