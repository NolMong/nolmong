import type { LiveMapPathObject } from "ably/liveobjects";
import { PlanCardData } from "@/types/plans";

// usePlanSync가 연결 시 보관하는 현재 계획의 root object.
// store 액션(React 밖)에서 Ably에 쓰기 위해 모듈 스코프로 유지한다.
let rootObject: LiveMapPathObject | null = null;

export function setPlanRootObject(obj: LiveMapPathObject | null) {
  rootObject = obj;
}

// 카드의 일부 필드를 Ably "cards" LiveMap에 전송 (낙관적 업데이트 후 전파용).
// LiveMap은 null을 저장할 수 없으므로 후보 카드의 위치는 예약값으로 표현한다.
// (day: null → "day-0", order: null → 0 — 수신 쪽 toCards에서 null로 복원)
export function pushCardFields(
  cardId: string,
  fields: Partial<Omit<PlanCardData, "id">>,
) {
  if (!rootObject) return;

  rootObject
    .get("cards")
    .get(cardId)
    .batch((ctx) => {
      Object.entries(fields).forEach(([key, value]) => {
        if (key === "day") {
          ctx.set(key, (value as string | null) ?? "day-0");
        } else if (key === "order") {
          ctx.set(key, (value as number | null) ?? 0);
        } else if (value === null || value === undefined) {
          ctx.remove(key);
        } else {
          ctx.set(key, value);
        }
      });
    })
    .catch((e: unknown) => console.error("Ably 카드 전송 실패:", e));
}

// 카드 삭제를 Ably에 전파
export function pushCardRemove(cardId: string) {
  if (!rootObject) return;

  rootObject
    .get("cards")
    .remove(cardId)
    .catch((e: unknown) => console.error("Ably 카드 삭제 전송 실패:", e));
}
