import type { PresenceMessage, RealtimeChannel } from "ably";
import { PlanPresenceData, PlanPresenceMember } from "@/types/presence";

// usePlanSync가 연결 시 보관하는 현재 계획의 채널과 내 presence 상태.
// 편집 시작/종료는 React 밖(카드 컴포넌트 핸들러)에서도 호출되므로 모듈 스코프로 유지한다.
let presenceChannel: RealtimeChannel | null = null;
let myPresenceData: PlanPresenceData | null = null;

export function setPlanPresence(
  channel: RealtimeChannel | null,
  data: PlanPresenceData | null,
) {
  presenceChannel = channel;
  myPresenceData = data;
}

// Ably presence 메시지 → 화면용 멤버 목록
// (payload가 없거나 형식이 다른 항목은 방어적으로 제외)
export function toPresenceMembers(
  messages: PresenceMessage[],
): PlanPresenceMember[] {
  return messages
    .filter((message) => message.data && typeof message.data === "object")
    .map((message) => ({
      ...(message.data as PlanPresenceData),
      clientId: message.clientId ?? "",
    }));
}

// 편집 중인 카드 목록을 갱신해 다른 참여자에게 전송
function sendEditingCardIds(editingCardIds: string[]) {
  if (!presenceChannel || !myPresenceData) return;

  myPresenceData = { ...myPresenceData, editingCardIds };
  presenceChannel.presence
    .update(myPresenceData)
    .catch((e: unknown) => console.error("presence 편집 상태 전송 실패:", e));
}

// 편집 시작 알림
export function addEditingCard(cardId: string) {
  const current = myPresenceData?.editingCardIds;
  if (!current || current.includes(cardId)) return; // 이미 있으면 전송 생략

  sendEditingCardIds([...current, cardId]);
}

// 편집 종료 알림.
// 카드별로 따로 넣고 빼므로, 여러 카드를 동시에 열어둔 경우에도
// 하나를 닫을 때 나머지 표시가 지워지지 않는다.
export function removeEditingCard(cardId: string) {
  const current = myPresenceData?.editingCardIds;
  if (!current || !current.includes(cardId)) return;

  sendEditingCardIds(current.filter((id) => id !== cardId));
}
