'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  size?: number;
  className?: string;
  disabled?: boolean;
}

export default function Checkbox({
  checked,
  onChange,
  size = 18,
  className = '',
  disabled = false,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center justify-center cursor-pointer select-none',
        disabled && 'cursor-not-allowed',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />

      {/* 체크박스 커스텀 테두리 박스 */}
      <span
        aria-hidden
        className={cn(
          'flex items-center justify-center rounded-sm border transition-all duration-150',
          checked
            ? 'border-primary bg-white text-primary' // 체크됨
            : 'border-border bg-white text-transparent', // 안됨
        )}
        style={{ width: size, height: size }}
      >
        {checked && (
          <Check size={size - 4} strokeWidth={3} className="text-primary" />
        )}
      </span>
    </label>
  );
}
