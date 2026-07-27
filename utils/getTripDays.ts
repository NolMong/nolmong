export interface TripDay {
  dayId: string; // 'day-1', 'day-2', ...
  dayNumber: number;
  dateText: string; // '8.8 (토)'
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

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
