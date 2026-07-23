export type PlanCardType = "CHECKLIST" | "PLACE" | "MEMO";

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

// export interface PlanCardData {
//   id: string;
//   day: string | null;
//   order: number | null;
//   type: PlanCardType;
//   // CHECKLIST
//   checklistItems?: { id: string; text: string; checked: boolean }[];
//   // PLACE
//   name?: string;
//   category?: string;
//   address?: string;
//   expense?: number;
//   x?: number;
//   y?: number;
//   // MEMO | PLACE
//   desc?: string;
//   times?: string[] | null;
// }
