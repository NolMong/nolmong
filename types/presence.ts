import { ProfileTheme, UserType } from "@/store/useUserStore";

// Ably presence로 주고받는 참여자 정보(payload).
// clientId는 탭 단위 식별자라 "같은 사람의 다른 탭"을 구분하지 못하므로,
// 자기 자신 제외/인원 집계를 위해 userId를 함께 실어 보낸다.
export type PlanPresenceData = {
  userId: string;
  name: string; // 표시 이름 (카카오 닉네임)
  character: UserType; // capi | bara
  theme: ProfileTheme;
  // 지금 편집 모드로 열어둔 카드들. 한 탭에서 여러 카드를 동시에 열 수 있어 배열이다.
  editingCardIds: string[];
};

// 화면에서 사용하는 형태 (Ably가 붙여주는 clientId를 합침)
export type PlanPresenceMember = PlanPresenceData & {
  clientId: string; // 탭(연결) 단위 식별자
};
