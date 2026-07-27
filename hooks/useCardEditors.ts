"use client";

import { useMemo } from "react";
import { usePresenceStore } from "@/store/usePresenceStore";
import { ProfileTheme, UserType } from "@/store/useUserStore";

export type CardEditor = {
  clientId: string;
  name: string;
  character: UserType;
  theme: ProfileTheme;
  isMyOtherTab: boolean; // 같은 계정의 다른 탭이면 이름 대신 안내 문구
};

// 해당 카드를 편집 중인 "나 이외의" 참여자 목록.
// 이 탭의 나는 제외하고, 같은 계정의 다른 탭은 남겨서 자기 충돌도 알 수 있게 한다.
export function useCardEditors(cardId: string): CardEditor[] {
  const members = usePresenceStore((s) => s.members);
  const myClientId = usePresenceStore((s) => s.myClientId);
  const myUserId = usePresenceStore((s) => s.myUserId);

  // 매 렌더마다 새 배열을 만들면 이 값을 의존성으로 쓰는 쪽에서 문제가 되므로 메모이제이션
  return useMemo(() => {
    // presence 입장 전에는 나를 식별할 수 없다. 나를 남으로 표시하지 않도록 비워 둔다.
    if (!myClientId) return [];

    return (
      members
        .filter(
          (member) =>
            member.clientId !== myClientId &&
            // 옛 형식(단일 필드) payload를 보내는 참여자가 있어도 터지지 않게 방어
            Array.isArray(member.editingCardIds) &&
            member.editingCardIds.includes(cardId),
        )
        .map((member) => ({
          clientId: member.clientId,
          name: member.name,
          character: member.character,
          theme: member.theme,
          isMyOtherTab: member.userId === myUserId,
        }))
        // 다른 사람을 앞에 둬서 대표 문구에 실제 이름이 나오게 한다
        .sort((a, b) => Number(a.isMyOtherTab) - Number(b.isMyOtherTab))
    );
  }, [members, myClientId, myUserId, cardId]);
}

// 편집 중인 사람들을 한 줄 문구로
// 예: "OOO님이 수정 중", "다른 탭에서 수정 중", "OOO님 외 O명이 수정 중"
export function getEditorsLabel(editors: CardEditor[]) {
  if (editors.length === 0) return "";

  const [first, ...rest] = editors;

  if (rest.length === 0) {
    return first.isMyOtherTab
      ? "다른 탭에서 수정 중"
      : `${first.name || "OOO"}님이 수정 중`;
  }

  const firstName = first.isMyOtherTab ? "다른 탭" : `${first.name || "OOO"}님`;

  return `${firstName} 외 ${rest.length}명이 수정 중`;
}
