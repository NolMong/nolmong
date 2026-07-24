import * as Ably from "ably";
import { LiveObjects } from "ably/liveobjects";

let client: Ably.Realtime | null = null;

// 앱 전체에서 재사용하는 Ably 실시간 연결(싱글턴)
export function getAblyClient() {
  if (!client) {
    client = new Ably.Realtime({
      key: process.env.NEXT_PUBLIC_ABLY_API_KEY!,
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
