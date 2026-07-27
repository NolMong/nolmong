'use client';

import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './custom_calendar.css';
import type { TravelEntry } from '@/types/calendar';

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const TRAVEL_START_CLASS = 'travel-start';
const TRAVEL_END_CLASS = 'travel-end';
const TRAVEL_BETWEEN_CLASS = 'travel-between';

function getTravelTileClassName(
  date: Date,
  travels: (TravelEntry | undefined)[],
) {
  const dateKey = formatDateKey(date);

  for (const travel of travels) {
    if (!travel) continue;

    if (typeof travel === 'string') {
      if (dateKey === travel) {
        return `${TRAVEL_START_CLASS} ${TRAVEL_END_CLASS}`;
      }
      continue;
    }

    const classNames: string[] = [];
    if (dateKey === travel.start_day) classNames.push(TRAVEL_START_CLASS);
    if (dateKey === travel.end_day) classNames.push(TRAVEL_END_CLASS);
    if (classNames.length > 0) return classNames.join(' ');

    if (dateKey > travel.start_day && dateKey < travel.end_day) {
      return TRAVEL_BETWEEN_CLASS;
    }
  }

  return null;
}

export default function CalendarComponent({
  travels,
}: {
  travels: (TravelEntry | undefined)[];
}) {
  // const travels: (TravelEntry | undefined)[] = [
  //   { startDay: '2026-07-05', endDay: '2026-07-07' },
  //   '2027-07-01',
  //   { startDay: '2027-07-05', endDay: '2027-07-07' },
  //   '2027-07-10',
  //   '2027-07-15',
  //   { startDay: '2027-07-20', endDay: '2027-07-25' },
  // ];

  return (
    <Calendar
      calendarType='gregory'
      className={['font-jalnan', 'main-calendar']}
      formatDay={(_locale, date) => String(date.getDate())}
      tileClassName={({ date, view }) =>
        view === 'month' ? getTravelTileClassName(date, travels) : null
      }
      tileDisabled={({ view }) => view === 'month'}
    />
  );
}
