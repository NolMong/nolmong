'use client';

import React from 'react';

interface TimelineLeftProps {
  isLast?: boolean;
  type: string;
  placeOrderNumber?: number | string;
}

export default function TimelineLeft({
  isLast = false,
  type,
  placeOrderNumber,
}: TimelineLeftProps) {
  return (
    <div className="relative flex flex-col items-center shrink-0 w-5">
      {!isLast && <div className="h-full bottom-0 w-0.5 bg-border z-10" />}

      {type === 'PLACE' ? (
        <span className="absolute top-4 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-regular font-jalnan-gothic z-10 pt-1">
          {placeOrderNumber}
        </span>
      ) : (
        <span className="absolute top-4 w-2 h-2 rounded-full bg-primary z-10" />
      )}
    </div>
  );
}
