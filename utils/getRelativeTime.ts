// utils/relativeTime.ts
import dayjs from 'dayjs';

export function getRelativeTime(date: string | Date | number): string {
  const target = dayjs(date);
  const now = dayjs();

  const diffSec = now.diff(target, 'second');
  const diffMin = now.diff(target, 'minute');
  const diffHour = now.diff(target, 'hour');
  const diffDay = now.diff(target, 'day');
  const diffMonth = now.diff(target, 'month');
  const diffYear = now.diff(target, 'year');

  if (diffYear >= 5) return '오래 전';
  if (diffYear >= 1) return `${diffYear}년 전`;
  if (diffMonth >= 1) return `${diffMonth}개월 전`;
  if (diffDay >= 1) return `${diffDay}일 전`;
  if (diffHour >= 1) return `${diffHour}시간 전`;
  if (diffMin >= 1) return `${diffMin}분 전`;
  if (diffSec >= 1) return `${diffSec}초 전`;

  return '방금 전';
}
