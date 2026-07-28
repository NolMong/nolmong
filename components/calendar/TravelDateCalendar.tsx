'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './travel_calendar.css';

const MONTHS_LOAD_STEP = 6;
const INITIAL_MONTHS_AHEAD = 12;

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

// 이미 등록된 여행(travels prop)이 이 날짜와 겹치면 붙일 클래스들을 모은다.
// 지금 고르고 있는 새 일정(travel-start/end/between)과 이름이 겹치지 않게 접두사를 다르게 둠
function getExistingTravelClassNames(
  dateKey: string,
  travels: (string | { start_day: string; end_day: string })[],
) {
  const classNames = new Set<string>();

  for (const travel of travels) {
    if (!travel) continue;

    if (typeof travel === 'string') {
      if (dateKey === travel) {
        classNames.add('existing-start');
        classNames.add('existing-end');
      }
      continue;
    }

    if (dateKey === travel.start_day) classNames.add('existing-start');
    if (dateKey === travel.end_day) classNames.add('existing-end');
    if (dateKey > travel.start_day && dateKey < travel.end_day) {
      classNames.add('existing-between');
    }
  }

  return classNames;
}

export default function TravelDateCalendar({
  startDay,
  endDay,
  oneDayTrip = false,
  onChange,
  travels,
}: {
  startDay: string;
  endDay: string;
  oneDayTrip?: boolean;
  onChange: (range: { startDay: string; endDay: string }) => void;
  travels?: (string | { start_day: string; end_day: string })[];
}) {
  // new Date()를 render 중에 바로 쓰면 서버(UTC)와 클라이언트(KST) 타임존이 달라
  // 자정 근처에 날짜가 어긋나 hydration mismatch가 나서, null로 시작해 클라이언트에서만 채운다
  console.log('DEBUG TravelDateCalendar render', {
    startDay,
    endDay,
    oneDayTrip,
    travels,
  });
  const [today, setToday] = useState<Date | null>(null);

  const [monthsAhead, setMonthsAhead] = useState(INITIAL_MONTHS_AHEAD);
  const currentMonthRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setToday(new Date()));
    return () => cancelAnimationFrame(id);
  }, []);

  // 처음 열리면 이번달이 맨 위(중심)에 오도록 스크롤
  useEffect(() => {
    currentMonthRef.current?.scrollIntoView({ block: 'start' });
  }, [today]);

  // 아래로 스크롤하면 다음 달들을 계속 이어서 로드
  useEffect(() => {
    const target = bottomRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMonthsAhead((prev) => prev + MONTHS_LOAD_STEP);
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!today) return null;

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const months: Date[] = [
    new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1),
  ];
  for (let i = 0; i <= monthsAhead; i++) {
    months.push(new Date(thisMonth.getFullYear(), thisMonth.getMonth() + i, 1));
  }

  const handleClickDay = (date: Date) => {
    const dateKey = formatDateKey(date);

    if (oneDayTrip) {
      onChange({ startDay: dateKey, endDay: dateKey });
      return;
    }

    if (!startDay || (startDay && endDay) || dateKey < startDay) {
      onChange({ startDay: dateKey, endDay: '' });
      return;
    }

    onChange({ startDay, endDay: dateKey });
  };

  const getTileClassName = (date: Date) => {
    const dateKey = formatDateKey(date);
    const classNames = getExistingTravelClassNames(dateKey, travels ?? []);

    if (dateKey === startDay) classNames.add('travel-start');
    if (dateKey === endDay) classNames.add('travel-end');
    if (
      !classNames.has('travel-start') &&
      !classNames.has('travel-end') &&
      startDay &&
      endDay &&
      dateKey > startDay &&
      dateKey < endDay
    ) {
      classNames.add('travel-between');
    }

    return classNames.size > 0 ? Array.from(classNames).join(' ') : null;
  };

  return (
    <div className='travel-date-calendar h-full overflow-y-auto scrollbar-thin flex flex-col gap-8'>
      {months.map((monthDate, i) => {
        const isCurrentMonth =
          monthDate.getFullYear() === thisMonth.getFullYear() &&
          monthDate.getMonth() === thisMonth.getMonth();
        return (
          <div key={i} ref={isCurrentMonth ? currentMonthRef : undefined}>
            <div className='text-sub text-lg text-center font-medium py-2 mb-2'>
              {monthLabel(monthDate)}
            </div>
            <Calendar
              activeStartDate={monthDate}
              calendarType='gregory'
              showNavigation={false}
              minDetail='month'
              maxDetail='month'
              formatDay={(_locale, date) => String(date.getDate())}
              onClickDay={handleClickDay}
              tileClassName={({ date, view }) =>
                view === 'month' ? getTileClassName(date) : null
              }
            />
          </div>
        );
      })}
      <div ref={bottomRef} className='h-1' />
    </div>
  );
}
