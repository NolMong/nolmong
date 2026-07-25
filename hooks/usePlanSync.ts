'use client';

import { useEffect } from 'react';
import { LiveMap } from 'ably/liveobjects';
import { channelOptions, getAblyClient } from '@/lib/ably/client';
import { setPlanRootObject } from '@/lib/ably/planObject';
import { usePlanStore } from '@/store/usePlanStore';
import { PlanCardData } from '@/types/plans';

// Ably "cards" LiveMap의 JSON 형태: key = 카드 id, value = 카드 내용
// (LiveMap은 null을 저장할 수 없어 후보 카드는 day: "day-0", order: 0 예약값으로 표현)
type CardsMap = Record<
  string,
  Omit<PlanCardData, 'id' | 'day' | 'order'> & { day: string; order: number }
>;

// LiveMap JSON → PlanCardData[] 변환 (맵의 key를 id 필드로 합침)
function toCards(json?: CardsMap): PlanCardData[] {
  return (
    Object.entries(json ?? {})
      // 값이 객체(정상 카드)인 것만 사용 — 오염된 flat 필드 방어
      .filter(([, value]) => value !== null && typeof value === 'object')
      .map(([id, value]) => ({
        ...value,
        id,
        day: value.day,
        order: value.order,
      }))
  );
}

// [id] 계획 페이지의 Ably 채널(채널명 = 계획 uuid)을 구독해서
// "title" 프리미티브와 "cards" LiveMap 변경을 usePlanStore에 반영하는 동기화 훅
export function usePlanSync(uuid: string) {
  const setTitle = usePlanStore((s) => s.setTitle);
  const setCards = usePlanStore((s) => s.setCards);
  const setStartDay = usePlanStore((s) => s.setStartDay);
  const setEndDay = usePlanStore((s) => s.setEndDay);
  const setBudget = usePlanStore((s) => s.setBudget);
  const setHeadcount = usePlanStore((s) => s.setHeadcount);

  useEffect(() => {
    const channel = getAblyClient().channels.get(uuid, channelOptions);

    let mounted = true;
    const subscriptions: { unsubscribe: () => void }[] = [];

    (async () => {
      try {
        const rootObject = await channel.object.get();
        if (!mounted) return;

        // store 액션(pushCardFields 등)이 Ably에 쓸 수 있도록 등록
        setPlanRootObject(rootObject);

        const titlePath = rootObject.get('title');
        const startDayPath = rootObject.get('start_day');
        const endDayPath = rootObject.get('end_day');
        const budgetPath = rootObject.get('budget');
        const headcountPath = rootObject.get('headcount');
        let cardsPath = rootObject.get('cards');

        // 과거 버그 등으로 "cards"가 LiveMap이 아닌 값(배열 등)으로 저장된
        // 채널이면 pushCardFields의 cards.get(id) 경로 탐색이 매번 실패한다.
        // instance()가 undefined면 맵으로 해석 안 되는 상태라, 빈 LiveMap으로
        // 되살려서 이후 카드 추가/수정이 정상 동작하게 한다.
        if (cardsPath.instance() === undefined) {
          await rootObject.set('cards', LiveMap.create({}));
          cardsPath = rootObject.get('cards');
        }

        // 마운트 시점에 저장돼 있는 값을 1회 읽어서 반영
        // (subscribe는 "변경 시"에만 발화하므로 초기값은 여기서 직접 반영)
        setTitle((titlePath.value() as string | undefined) ?? '');
        setCards(toCards(cardsPath.compactJson() as CardsMap | undefined));
        setStartDay((startDayPath.value() as string | undefined) ?? '');
        setEndDay((endDayPath.value() as string | undefined) ?? '');
        setBudget((budgetPath.value() as number | undefined) ?? 0);
        setHeadcount((headcountPath.value() as number | undefined) ?? 0);

        // 이후 값이 바뀔 때마다 store 갱신
        // 경로에 값이 아직 없어도 구독은 유효 — 생성되는 순간부터 발화됨
        subscriptions.push(
          titlePath.subscribe(() => {
            setTitle((titlePath.value() as string | undefined) ?? '');
          }),
          cardsPath.subscribe(() => {
            setCards(toCards(cardsPath.compactJson() as CardsMap | undefined));
          }),
          startDayPath.subscribe(() => {
            setStartDay((startDayPath.value() as string | undefined) ?? '');
          }),
          endDayPath.subscribe(() => {
            setEndDay((endDayPath.value() as string | undefined) ?? '');
          }),
          budgetPath.subscribe(() => {
            setBudget((budgetPath.value() as number | undefined) ?? 0);
          }),
          headcountPath.subscribe(() => {
            setHeadcount((headcountPath.value() as number | undefined) ?? 0);
          }),
        );
      } catch (e) {
        // StrictMode의 mount→cleanup→mount 이중 실행 등으로 연결이 닫힌 뒤
        // 남은 요청이 실패하는 건 정상이라 무시하고, 그 외의 에러만 로그
        if (mounted) console.error('Ably 계획 동기화 실패:', e);
      }
    })();

    return () => {
      mounted = false;
      setPlanRootObject(null);
      subscriptions.forEach((s) => s.unsubscribe());
      // channel도 client와 마찬가지로 이름별 공유 인스턴스라, 여기서 detach하면
      // StrictMode의 mount→cleanup→mount 이중 실행 시 뒤이은 진짜 마운트가 같은
      // 채널을 쓰다가 "Channel detached"를 맞는다. 구독만 정리하고 채널 연결은 유지한다.
    };
  }, [
    uuid,
    setTitle,
    setCards,
    setStartDay,
    setEndDay,
    setBudget,
    setHeadcount,
  ]);
}
