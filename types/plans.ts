export type PlanCardType = 'CHECKLIST' | 'PLACE' | 'MEMO';

export interface PlanCardData {
  id: string;
  day: string | null; // 'day-1', 'day-2', 'day-3' 또는 후보 리스트일 때 null
  order: number | null; // 전체 카드 내 순서
  type: PlanCardType;

  // CHECKLIST 전용
  checklistItems?: { id: string; text: string; checked: boolean }[];

  // PLACE 전용
  name?: string;
  category?: string;
  address?: string;
  expense?: number;
  x?: number;
  y?: number;

  // MEMO | PLACE 공통
  desc?: string;
  times?: string[] | null; // ['11:00', '13:00'] 또는 null

  // UI 동적 계산용 (DB 저장 안 함)
  placeOrderNumber?: number;
}
