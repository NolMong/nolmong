'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean; // 현재 버튼이 선택된 상태인지 여부
}

export default function FilterButton({
  children,
  isActive = false,
  className,
  ...props
}: FilterButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center text-sm font-medium rounded-full w-fit py-2 px-[14px] cursor-pointer select-none transition-colors border-1 border-border',
        isActive
          ? // Active
            'bg-primary border-primary text-white'
          : // Inactive
            'bg-white border-border text-sub hover:bg-border/30',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
