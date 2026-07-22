'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'react-calendar';
import type { Value } from 'react-calendar/dist/shared/types.js';
import 'react-calendar/dist/Calendar.css';
import './custom_calendar.css';

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
  // new Date()를 useState 초기값으로 바로 넣으면 서버 렌더와 클라이언트 첫 렌더의
  // 시각이 미세하게 달라 hydration mismatch가 나서, null로 시작해 클라이언트에서만 채운다
  const [value, setValue] = useState<Value>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setValue(new Date()));
    return () => cancelAnimationFrame(id);
  }, []);

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
      className={['font-jalnan', 'main-calendar']}
      formatDay={(_locale, date) => String(date.getDate())}
      tileClassName={({ date, view }) =>
        view === 'month' ? getTravelTileClassName(date, travels) : null
      }
    />
  );
}
