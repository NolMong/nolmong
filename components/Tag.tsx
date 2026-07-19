'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Tag({ children, className, ...props }: TagProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center bg-color-primary-light text-primary font-jalnan text-xs rounded-full px-3 py-1 w-fit select-none',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
