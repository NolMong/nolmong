import * as Ably from "ably";
import { LiveObjects } from "ably/liveobjects";

let client: Ably.Realtime | null = null;

// 이 탭(브라우저 세션)을 식별하는 값. Presence는 clientId 없이 enter()가 실패한다.
// 로그인 사용자 정보는 presence payload로 따로 실어 보내므로 여기서는 탭 단위 임의값을 쓴다.
// (사용자 id를 쓰면 싱글턴 특성상 계정 전환 시 이전 id로 남는 문제가 생김)
let clientId: string | null = null;

export function getAblyClientId() {
  if (!clientId) clientId = crypto.randomUUID();
  return clientId;
}

// 앱 전체에서 재사용하는 Ably 실시간 연결(싱글턴)
// 브라우저에서만 호출된다(모든 사용처가 effect/이벤트 핸들러 안)
export function getAblyClient() {
  if (!client) {
    client = new Ably.Realtime({
      key: process.env.NEXT_PUBLIC_ABLY_API_KEY!,
      clientId: getAblyClientId(), // Presence 사용을 위해 필수
      plugins: { LiveObjects },
    });
  }
  return client;
}

// Ably 채널에서 사용하는 옵션 목록
export const channelOptions: Ably.ChannelOptions = {
  modes: [
    "OBJECT_SUBSCRIBE",
    "OBJECT_PUBLISH",
    "PRESENCE",
    "PRESENCE_SUBSCRIBE",
  ],
};
