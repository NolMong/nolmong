'use client';

import React from 'react';
import FilterButton from './FilterButton';

interface FilterGroupProps {
  options: string[]; // 배열 데이터
  value: string; // 현재 선택된 값
  onChange: (value: string) => void; // 선택이 바뀔 때 실행할 함수
}

export default function FilterGroup({
  options,
  value,
  onChange,
}: FilterGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((option) => (
        <FilterButton
          key={option}
          isActive={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </FilterButton>
      ))}
    </div>
  );
}
