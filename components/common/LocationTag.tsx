import React from 'react';
import { X, Plus } from 'lucide-react';

export default function LocationTag({
  text,
  onClick,
  onAdd,
  onTextChange,
  status,
}: {
  text: string;
  onClick?: () => void;
  onAdd?: () => void;
  onTextChange?: (text: string) => void;
  status?: 'editable' | 'fixed';
}) {
  return (
    <div className='inline-flex shrink-0 items-center justify-center text-sm font-medium text-main rounded-full w-fit py-1.5 px-2 select-none transition-colors border border-border gap-1.5'>
      {status === 'editable' ? (
        <Plus
          color='var(--color-muted)'
          size={18}
          className='shrink-0 rounded-full bg-border cursor-pointer'
          onClick={onAdd}
        />
      ) : null}

      {status === 'editable' ? (
        <input
          className='whitespace-nowrap outline-none min-w-0 w-16'
          value={text}
          placeholder='여행지'
          maxLength={8}
          onChange={(e) => onTextChange?.(e.target.value)}
        />
      ) : (
        <div className='whitespace-nowrap'>{text}</div>
      )}

      <X
        size={18}
        color='var(--color-muted)'
        className='shrink-0 cursor-pointer'
        onClick={onClick}
      />
    </div>
  );
}
