export type PlanCardType = 'CHECKLIST' | 'PLACE' | 'MEMO';

export interface PlanCardData {
  id: string;
  type: PlanCardType;
  placeOrderNumber?: number;
  title?: string;
  category?: string;
  location?: string;
  visitTime?: string;
  cost?: string;
  memo?: string;
  checklistItems?: { id: string; text: string; checked: boolean }[];
}
