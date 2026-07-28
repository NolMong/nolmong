import dayjs from 'dayjs';

export function isPastEndDay(end_day: string | Date): boolean {
  return !dayjs(end_day).isAfter(dayjs(), 'day');
}
