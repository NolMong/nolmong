import React from 'react';
import { FilterGroup, ProfileAvatar } from '@/components';
import { locations } from '@/data/locations';

type ChooseStartLocationProps =
  | {
      multiple?: false; // 출발지: 하나만 선택
      selectedCity?: string;
      onSelect?: (city: string) => void;
    }
  | {
      multiple: true; // 여행지: 여러 개 선택
      selectedCities?: string[];
      onSelect?: (cities: string[]) => void;
    };

export default function ChooseStartLocation(props: ChooseStartLocationProps) {
  return (
    <div className='w-108 flex flex-col  gap-8'>
      {locations.map((l, i) => {
        const options = l.options.map((city) => city.city);
        return (
          <div key={i}>
            <div className='text-lg font-medium text-sub mb-3.5'>
              &nbsp;{l.title}
            </div>
            {props.multiple ? (
              <FilterGroup
                multiple
                options={options}
                value={props.selectedCities ?? []}
                onChange={props.onSelect ?? (() => {})}
              />
            ) : (
              <FilterGroup
                options={options}
                value={props.selectedCity ?? ''}
                onChange={props.onSelect ?? (() => {})}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
