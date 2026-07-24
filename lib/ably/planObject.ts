import type { LiveMapPathObject, Value } from "ably/liveobjects";
import { LiveMap } from "ably/liveobjects";
import { PlanCardData } from "@/types/plans";

// usePlanSync가 연결 시 보관하는 현재 계획의 root object.
// store 액션(React 밖)에서 Ably에 쓰기 위해 모듈 스코프로 유지한다.
let rootObject: LiveMapPathObject | null = null;

export function setPlanRootObject(obj: LiveMapPathObject | null) {
  rootObject = obj;
}

// PlanCardData 필드 → LiveMap 저장용 값으로 변환.
// day/order의 null은 예약값(day-0, 0)으로, 그 외 null/undefined 필드는 제외한다.
function toLiveMapEntries(
  fields: Partial<Omit<PlanCardData, "id">>,
): Record<string, Value> {
  const entries: Record<string, Value> = {};
  Object.entries(fields).forEach(([key, value]) => {
    if (key === "day") {
      entries[key] = (value as string | null) ?? "day-0";
    } else if (key === "order") {
      entries[key] = (value as number | null) ?? 0;
    } else if (value !== null && value !== undefined) {
      entries[key] = value as Value;
    }
  });
  return entries;
}

// 새 카드를 Ably "cards" LiveMap에 생성(중첩 LiveMap으로 추가)해 전파
export function pushCardCreate(card: PlanCardData) {
  if (!rootObject) return;

  const { id, ...fields } = card;
  rootObject
    .get("cards")
    .set(id, LiveMap.create(toLiveMapEntries(fields)))
    .catch((e: unknown) => console.error("Ably 카드 생성 전송 실패:", e));
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
          ctx.set(key, (value as string) ?? "day-0");
        } else if (key === "order") {
          ctx.set(key, (value as number) ?? 0);
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
