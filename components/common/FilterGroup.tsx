'use client';

import React from 'react';
import FilterButton from './FilterButton';

type FilterGroupProps =
  | {
      multiple?: false; // 하나만 선택
      options: string[]; // 배열 데이터
      value: string; // 현재 선택된 값
      onChange: (value: string) => void; // 선택이 바뀔 때 실행할 함수
    }
  | {
      multiple: true; // 여러 개 선택
      options: string[]; // 배열 데이터
      value: string[]; // 현재 선택된 값들
      onChange: (value: string[]) => void; // 선택이 바뀔 때 실행할 함수
    };

export default function FilterGroup(props: FilterGroupProps) {
  const { options } = props;

  const isActive = (option: string) =>
    props.multiple ? props.value.includes(option) : props.value === option;

  const handleClick = (option: string) => {
    if (props.multiple) {
      const next = props.value.includes(option)
        ? props.value.filter((v) => v !== option)
        : [...props.value, option];
      props.onChange(next);
      return;
    }
    props.onChange(option);
  };

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {options.map((option) => (
        <FilterButton
          key={option}
          isActive={isActive(option)}
          onClick={() => handleClick(option)}
        >
          {option}
        </FilterButton>
      ))}
    </div>
  );
}
