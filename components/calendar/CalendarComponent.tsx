'use client';

import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './custom_calendar.css';
import type { TravelEntry } from '@/types/calendar';

function formatDateKey(date: Date) {
  console.log('formatDateKey', date);
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
  // 여러 여행 일정이 같은 날짜에 겹칠 수 있어서(A 여행 끝나는 날 = B 여행 시작일 등),
  // 첫 매칭에서 바로 return하지 않고 전부 순회하며 클래스를 모은다
  const classNames = new Set<string>();

  for (const travel of travels) {
    if (!travel) continue;

    if (typeof travel === 'string') {
      if (dateKey === travel) {
        classNames.add(TRAVEL_START_CLASS);
        classNames.add(TRAVEL_END_CLASS);
      }
      continue;
    }

    if (dateKey === travel.start_day) classNames.add(TRAVEL_START_CLASS);
    if (dateKey === travel.end_day) classNames.add(TRAVEL_END_CLASS);
    if (dateKey > travel.start_day && dateKey < travel.end_day) {
      classNames.add(TRAVEL_BETWEEN_CLASS);
    }
  }

  return classNames.size > 0 ? Array.from(classNames).join(' ') : null;
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
      locale='ko-KR'
      className={['font-jalnan', 'main-calendar']}
      formatDay={(_locale, date) => String(date.getDate())}
      tileClassName={({ date, view }) =>
        view === 'month' ? getTravelTileClassName(date, travels) : null
      }
      tileDisabled={({ view }) => view === 'month'}
    />
  );
}
