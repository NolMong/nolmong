'use client';

import React from 'react';
import FilterButton from './FilterButton';

type FilterGroupProps = {
  scroll?: boolean;
} & (
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
    }
);

// 'day-1' -> 'Day 1' (대시를 공백으로, 첫 글자만 대문자)
function formatOptionLabel(option: string) {
  const label = option.replace('-', ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

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

  const onWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    container.scrollLeft += e.deltaY;
  };

  return (
    <div
      className={`flex items-center gap-2 shrink-0 ${
        props.scroll === true
          ? 'flex-nowrap overflow-x-auto overflow-y-hidden scrollbar-thin'
          : 'flex-wrap'
      }`}
      onWheel={props.scroll === true ? onWheelScroll : undefined}
    >
      {options.map((option) => (
        <FilterButton
          key={option}
          isActive={isActive(option)}
          onClick={() => handleClick(option)}
        >
          {formatOptionLabel(option)}
        </FilterButton>
      ))}
    </div>
  );
}
