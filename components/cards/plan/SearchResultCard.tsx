'use client';

import { useState } from 'react';
import { FilterButton, MainButton } from '@/components';
import { MapPin } from 'lucide-react';

interface SearchResultCardProps {
  data: kakao.maps.services.PlacesSearchResultItem;
  onAddPlace?: (data: kakao.maps.services.PlacesSearchResultItem) => void;
}

export default function SearchResultCard({
  data,
  onAddPlace,
}: SearchResultCardProps) {
  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    container.scrollLeft += e.deltaY;
  };
  const [selectedOption, setSelectedOption] = useState<string | null>('미정');
  const options = ['미정', 'Day1', 'Day2', 'Day3', 'Day4'];
  const category = data.category_name.split(' > ').pop() || data.category_name;
  const address = data.road_address_name || data.address_name;

  return (
    <div
      className=' box w-65 rounded-lg border border-border p-3'
      onClick={() => {
        console.log('SearchResultCard clicked:', data);
      }}
    >
      <div className='font-jalnan-gothic text-sm text-main mb-1 truncate'>
        {data.place_name}
      </div>
      <div className=' relative flex items-center gap-2 mb-2.5'>
        <MapPin size={14} color='var(--color-primary)'></MapPin>
        <div className='font-regular text-[12px] text-muted truncate'>
          {category} · {address}
        </div>
      </div>
      <div
        onWheel={handleWheelScroll}
        className='flex flex-1 min-w-0 gap-1 overflow-x-auto scrollbar-hide mb-1.5'
      >
        {options.map((option, index) => (
          <FilterButton
            key={index}
            style={{ flexShrink: 0 }}
            isActive={selectedOption === option}
            onClick={() => setSelectedOption(option)}
          >
            {option}
          </FilterButton>
        ))}
      </div>
      <div className='flex justify-center gap-1.5'>
        <MainButton
          variant='default'
          style={{ fontSize: '14px', flex: 1 }}
          onClick={() => window.open(`${data.place_url}`, '_blank')}
        >
          상세 보기
        </MainButton>
        <MainButton
          variant='fill'
          style={{
            fontSize: '14px',
            flex: 1,
          }}
          onClick={() => onAddPlace?.(data)}
        >
          일정 추가
        </MainButton>
      </div>
    </div>
  );
}
