'use client';

import * as Ably from 'ably';
import { LiveObjects, LiveMap } from 'ably/liveobjects';
import type { LiveMapPathObject } from 'ably/liveobjects';
import { useEffect, useRef, useState } from 'react';

// "data" 맵의 각 항목(중첩 LiveMap)에 저장되는 값의 구조
interface Item {
  order: number; // 표시 순서 (위치 변경 시 사용)
  text: string; // 입력한 내용
  createdAt: number; // 생성 시각(ms)
}

// "data" LiveMap 전체 구조: key = 항목 id(string), value = 항목
type DataMap = Record<string, Item>;

// LiveObjects의 "data" 맵(JSON) → 화면용 배열로 변환
// (맵의 key를 id로 합치고, 저장 시각순으로 정렬)
function toItems(json?: DataMap): (Item & { id: string })[] {
  return (
    Object.entries(json ?? {})
      // 값이 객체(정상 항목)인 것만 사용 — 과거 버전이 남긴 flat 필드(text 등) 걸러냄
      .filter(([, value]) => value !== null && typeof value === 'object')
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => a.createdAt - b.createdAt)
  );
}

export default function Test() {
  const [text, setText] = useState('');
  const [items, setItems] = useState<(Item & { id: string })[]>([]);

  // 인라인 편집 상태: 편집 중인 항목 id와 입력값
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // 이 세션(브라우저 탭)을 식별하는 clientId — Presence용, 마운트 시 1회 생성
  // useState 초기화 함수에서 바로 생성하면 서버/클라이언트 렌더 값이 달라 hydration 에러가 나서
  // null로 시작하고 클라이언트에서만 실행되는 useEffect에서 채운다
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setClientId(crypto.randomUUID()));
    return () => cancelAnimationFrame(id);
  }, []);

  // presence 멤버 목록 (누가 어떤 항목을 편집 중인지)
  const [presenceMembers, setPresenceMembers] = useState<
    Ably.PresenceMessage[]
  >([]);

  // 마운트 시 1회만 가져온 root object를 클릭 핸들러에서 재사용하기 위한 ref
  const rootObjectRef = useRef<LiveMapPathObject | null>(null);
  // presence 호출(enter/update)을 위해 channel도 ref로 보관
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  // ==================== 마운트 시 실행 ====================
  useEffect(() => {
    // clientId가 아직 없으면(첫 렌더 직후) 연결을 시작하지 않음
    if (!clientId) return;

    const realtimeClient = new Ably.Realtime({
      // 퍼블릭 지정은 이후 수정 필요
      key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
      clientId, // Presence 사용을 위해 필수
      plugins: { LiveObjects },
    });

    // modes 종류 확인
    const channelOptions: Ably.ChannelOptions = {
      modes: [
        'OBJECT_SUBSCRIBE',
        'OBJECT_PUBLISH',
        'PRESENCE',
        'PRESENCE_SUBSCRIBE',
      ],
    };

    const channel = realtimeClient.channels.get('test', channelOptions);
    channelRef.current = channel;

    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    (async () => {
      try {
        const rootObject = await channel.object.get();
        if (!mounted) return;
        rootObjectRef.current = rootObject;

        const dataPath = rootObject.get('data');

        // 마운트 시점에 이미 저장돼 있는 리스트를 1회 읽어서 표시
        // (subscribe는 "변경 시"에만 발화하므로 초기값은 여기서 직접 반영)
        const initial = dataPath.compactJson() as DataMap | undefined;
        setItems(toItems(initial));

        // 이후 "data"가 바뀔 때마다(추가/수정/삭제) 화면 갱신
        // 주의: 콜백 인자의 object는 "변경이 일어난 지점"의 PathObject라,
        // 중첩 항목 수정 시 그 항목을 가리킴. 항상 "data" 경로를 다시 읽어야 함.
        subscription = dataPath.subscribe(() => {
          const json = dataPath.compactJson() as DataMap | undefined;
          console.log('저장된 값: ', json);
          setItems(toItems(json));
        });

        // ---- Presence: "누가 편집 중"을 방송/구독 ----
        // presence가 바뀔 때마다 현재 전체 멤버 목록을 다시 읽어 반영
        const syncPresence = async () => {
          const members = await channel.presence.get();
          if (mounted) setPresenceMembers(members);
        };

        // 편집 항목 없음(null) 상태로 입장 → 초기 목록 반영 → 이후 변경 구독
        if (!mounted) return;
        await channel.presence.enter({ editingId: null });
        if (!mounted) return;
        await syncPresence();
        channel.presence.subscribe(syncPresence);
      } catch (e) {
        // StrictMode의 mount→cleanup→mount 이중 실행 등으로 연결이 닫힌 뒤
        // 남은 요청이 실패하는 건 정상이라 조용히 무시하고, 그 외의 에러만 로그
        if (mounted) console.error('Ably 초기화 실패:', e);
      }
    })();

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
      channel.presence.unsubscribe();
      // 연결을 닫으면 서버가 자동으로 leave 처리 → 다른 세션에서 표시 사라짐
      realtimeClient.close();
      channelRef.current = null;
    };
  }, [clientId]);

  // ==================== 데이터 추가 ====================
  const handleClick = async () => {
    const rootObject = rootObjectRef.current;
    if (!rootObject) return;
    if (!text) return;

    // 이번에 추가할 항목: Item 구조(order, text, createdAt)를 모두 채움
    const id = crypto.randomUUID();
    // 맨 뒤 순번 = 현재 항목들의 최대 order + 1 (없으면 0)
    const nextOrder =
      items.length > 0 ? Math.max(...items.map((i) => i.order)) + 1 : 0;
    const item = LiveMap.create({
      order: nextOrder,
      text: text,
      createdAt: Date.now(),
    });

    const dataPath = rootObject.get('data');

    if (dataPath.instance()) {
      // "data" 리스트가 이미 있으면 기존 항목은 두고 새 항목만 추가(append)
      await dataPath.set(id, item);
    } else {
      // 최초 저장이면 "data" 리스트(맵)를 만들면서 첫 항목을 넣음
      await rootObject.set('data', LiveMap.create({ [id]: item }));
    }

    setText('');
  };

  // ==================== 데이터 수정: 편집 시작 ====================
  const handleEdit = (item: Item & { id: string }) => {
    setEditingId(item.id);
    setEditingText(item.text);

    // 편집 시작을 presence로 방송
    channelRef.current?.presence
      .update({ editingId: item.id })
      .catch((e) => console.error('presence update 실패:', e));
  };

  // ==================== 데이터 수정: 저장 (해당 항목의 text만 부분 수정) ====================
  const saveEdit = async () => {
    const rootObject = rootObjectRef.current;

    // 저장 대상/값을 먼저 스냅샷하고, 편집 상태는 "즉시(동기)" 종료한다.
    // await 이후에 editingId를 건드리면, 그 사이 다른 항목을 편집 시작한 걸
    // 덮어써버려(비동기 clobber) input이 틱하고 사라지는 문제가 생김.
    const id = editingId;
    const value = editingText;
    setEditingId(null);
    setEditingText('');

    // 편집 종료를 presence로 방송(편집 항목 없음)
    channelRef.current?.presence
      .update({ editingId: null })
      .catch((e) => console.error('presence update 실패:', e));

    if (!rootObject || !id) return;

    try {
      await rootObject.get('data').get(id).set('text', value);
    } catch (e) {
      // 경로 해석 실패 등(예: 오염된 데이터) — 페이지가 죽지 않도록 방어
      console.error('수정 저장 실패:', e);
    }
  };

  // ==================== 전체 데이터 초기화 ====================
  const handleDelete = async () => {
    const rootObject = rootObjectRef.current;
    if (!rootObject) return;

    await rootObject?.remove('data');
  };

  return (
    <div>
      <div>클라이언트 아이디: {clientId ?? '연결 중...'}</div>
      <input
        type='text'
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          border: '1px solid black',
          margin: '10px',
          padding: '5px 10px',
        }}
      />
      <button
        onClick={handleClick}
        style={{ border: '1px solid black', marginRight: '10px' }}
      >
        객체 추가
      </button>
      <button onClick={handleDelete} style={{ border: '1px solid black' }}>
        초기화
      </button>
      <div>
        <span>현재값 : {text}</span>
        <br />
        <span>저장된 값 (총 {items.length}개) :</span>
        <ul>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid black',
                padding: '5px',
                margin: '8px',
              }}
              onClick={() => {
                // 이미 이 항목을 편집 중이면 다시 시작하지 않음(입력값 초기화 방지)
                if (editingId !== item.id) handleEdit(item);
              }}
            >
              {editingId === item.id ? (
                <input
                  value={editingText}
                  autoFocus
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter로 저장(포커스 아웃 → onBlur의 saveEdit 실행)
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                  onBlur={saveEdit}
                />
              ) : (
                <>
                  {item.text}
                  {presenceMembers.some(
                    (m) =>
                      m.clientId !== clientId && m.data?.editingId === item.id,
                  ) && (
                    <span style={{ color: 'red', marginLeft: 8 }}>
                      (다른 사용자가 수정 중…)
                    </span>
                  )}
                </>
              )}
              <span style={{ color: 'gray', marginLeft: '8px' }}>
                ({new Date(item.createdAt).toLocaleTimeString()})
              </span>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}
