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

// 내가 편집 중인 카드를 다른 참여자에게 알림 (편집 종료 시 null)
export function updateEditingCard(cardId: string | null) {
  if (!presenceChannel || !myPresenceData) return;

  myPresenceData = { ...myPresenceData, editingCardId: cardId };
  presenceChannel.presence
    .update(myPresenceData)
    .catch((e: unknown) => console.error("presence 편집 상태 전송 실패:", e));
}
