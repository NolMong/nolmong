'use client';

import { useState } from 'react';
import { Calendar } from 'react-calendar';
import type { Value } from 'react-calendar/dist/shared/types.js';
import 'react-calendar/dist/Calendar.css';
import './custom_calendar.css';

const sizeClassMap = {
  small: 'w-100 h-100',
  medium: 'w-125 h-125',
  large: 'w-150 h-150',
};

type TravelEntry = string | { startDay: string; endDay: string };

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const TRAVEL_EDGE_CLASS = 'travel-edge';
const TRAVEL_BETWEEN_CLASS = 'travel-between';

function getTravelTileClassName(
  date: Date,
  travels: (TravelEntry | undefined)[],
) {
  const dateKey = formatDateKey(date);

  for (const travel of travels) {
    if (!travel) continue;

    if (typeof travel === 'string') {
      if (dateKey === travel) return TRAVEL_EDGE_CLASS;
      continue;
    }

    if (dateKey === travel.startDay || dateKey === travel.endDay) {
      return TRAVEL_EDGE_CLASS;
    }
    if (dateKey > travel.startDay && dateKey < travel.endDay) {
      return TRAVEL_BETWEEN_CLASS;
    }
  }

  return null;
}

export default function CalendarComponent({
  size,
}: {
  size: 'small' | 'medium' | 'large';
}) {
  const [value, setValue] = useState<Value>(new Date());
  const travels: (TravelEntry | undefined)[] = [
    '2027-07-01',
    { startDay: '2027-07-05', endDay: '2027-07-07' },
    '2027-07-10',
    '2027-07-15',
    { startDay: '2027-07-20', endDay: '2027-07-25' },
  ];

  return (
    <Calendar
      value={value}
      onChange={setValue}
      calendarType='gregory'
      className='font-jalnan'
      formatDay={(_locale, date) => String(date.getDate())}
      tileClassName={({ date, view }) =>
        view === 'month' ? getTravelTileClassName(date, travels) : null
      }
    />
  );
}
