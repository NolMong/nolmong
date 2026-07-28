import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export interface TripDay {
  dayId: string; // 'day-1', 'day-2', ...
  dayNumber: number;
  dateText: string; // '8.8 (토)'
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// start_day ~ end_day('YYYY-MM-DD', 양끝 포함) 구간을 하루 단위 Day 목록으로 펼친다.
// 날짜만 있는 문자열은 UTC 자정으로 파싱되므로, 로컬 타임존으로 하루씩 밀리는 걸
// 막기 위해 순회/포맷 전부 UTC 기준 메서드로 계산한다.
export function getTripDays(startDay: string, endDay: string): TripDay[] {
  if (!startDay || !endDay) return [];

  const start = new Date(`${startDay}T00:00:00Z`);
  const end = new Date(`${endDay}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const days: TripDay[] = [];
  const cursor = new Date(start);
  let dayNumber = 1;

  while (cursor.getTime() <= end.getTime()) {
    days.push({
      dayId: `day-${dayNumber}`,
      dayNumber,
      dateText: `${cursor.getUTCMonth() + 1}.${cursor.getUTCDate()} (${WEEKDAYS[cursor.getUTCDay()]})`,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    dayNumber++;
  }

  return days;
}

// 시간 포맷 함수
export const formatTimeInput = (value: string): string => {
  const numbersOnly = value.replace(/\D/g, '').slice(0, 4);

  if (numbersOnly.length <= 2) {
    return numbersOnly;
  }
  return `${numbersOnly.slice(0, 2)}:${numbersOnly.slice(2)}`;
};
