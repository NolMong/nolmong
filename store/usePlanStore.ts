import { create } from 'zustand';
import { PlanCardData, PlanCardType } from '@/types/plans';
import { arrayMove } from '@dnd-kit/sortable';
import {
  pushCardCreate,
  pushCardFields,
  pushCardMove,
  pushCardOrders,
  pushCardRemove,
  pushTitle,
} from '@/lib/ably/planObject';

interface PlanState {
  title: string;
  cards: PlanCardData[];
  start_day: string;
  end_day: string;
  budget: number;
  headcount: number;
  isDirty: boolean; // 자동 저장 감지
  newCardId: string | null; // 방금 추가돼 편집 모드로 열려야 하는 카드 id
  // 아직 Ably에 올리지 않은(저장 전) 카드 id 목록.
  // 수신한 서버 상태로 cards를 교체할 때 이 카드들이 지워지지 않도록 하는 데 쓴다.
  draftCardIds: string[];

  // 데이터 로딩 상태
  isLoaded: boolean;
  setIsLoaded: (isLoaded: boolean) => void;
  resetPlan: () => void;

  // 타이틀 수신 전용 (Ably subscribe로부터 반영 — 여기서 push하면 에코 루프 발생)
  setTitle: (title: string) => void;
  // 타이틀 편집 저장: 로컬 반영 + Ably로 전파
  updateTitle: (title: string) => void;
  // 카드 관련
  setCards: (cards: PlanCardData[]) => void;
  addCard: (type: PlanCardType, day: string) => void;
  clearNewCard: () => void;
  clearDrafts: () => void; // 계획 이탈 시 로컬 전용 draft 정리
  commitCard: (card: PlanCardData) => void; // draft의 첫 저장(확인) — 이때 Ably 생성
  discardCard: (id: string) => void; // draft 취소 — 로컬에서만 제거
  updateCard: (updatedCard: PlanCardData) => void;
  deleteCard: (id: string) => void;
  setStartDay: (start_day: string) => void;
  setEndDay: (end_day: string) => void;
  setBudget: (budget: number) => void;
  setHeadcount: (headcount: number) => void;
  moveCardToDay: (activeId: string, targetDay: string) => void;
  reorderCardsInDay: (
    targetDay: string | null,
    activeId: string,
    overId: string,
  ) => void;
  resetIsDirty: () => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  title: '',
  cards: [],
  start_day: '',
  end_day: '',
  budget: 0,
  headcount: 0,
  isDirty: false,
  newCardId: null,
  draftCardIds: [],

  // 초기 로딩값
  isLoaded: false,
  setIsLoaded: (isLoaded) => set({ isLoaded }),

  // 이전 플랜 잔상을 지우기 위해 초기화
  resetPlan: () =>
    set({
      title: '',
      cards: [],
      start_day: '',
      end_day: '',
      budget: 0,
      headcount: 0,
      isDirty: false,
      newCardId: null,
      draftCardIds: [],
      isLoaded: false, // 스켈레톤이 다시 보이도록 처리
    }),

  setTitle: (title) => set({ title }),

  updateTitle: (title) => {
    set({ title, isDirty: true });
    pushTitle(title);
  },

  // 수신(에코 포함)이 로컬 변경의 isDirty를 씻지 않도록 cards만 교체.
  // 단, 아직 서버에 올리지 않은 내 draft는 교체 대상에서 제외해 살려둔다.
  // (draft는 로컬 전용이라 서버 상태로 통째 교체하면 작성 중이던 카드가 사라짐)
  setCards: (cards) =>
    set((state) => {
      const serverIds = new Set(cards.map((c) => c.id));
      const keptDrafts = state.cards.filter(
        (c) =>
          state.draftCardIds.includes(c.id) &&
          // 저장 직후 에코처럼 서버에도 생긴 카드는 서버 버전이 이겨야 한다
          !serverIds.has(c.id),
      );

      // 화면은 order로 정렬해 그리므로 뒤에 붙어도 표시 위치는 유지된다
      return {
        cards: [...cards, ...keptDrafts],
        isLoaded: true, // 데이터가 동기화되면 로딩 완료
      };
    }),
  setStartDay: (start_day) => set({ start_day }),
  setEndDay: (end_day) => set({ end_day }),
  setBudget: (budget) => set({ budget }),
  setHeadcount: (headcount) => set({ headcount }),

  clearNewCard: () => set({ newCardId: null }),

  // 계획 페이지를 벗어날 때 로컬 전용 draft를 정리한다.
  // store가 모듈 스코프라 그대로 두면 다른 계획 화면까지 따라간다.
  clearDrafts: () =>
    set((state) => ({
      cards: state.cards.filter((c) => !state.draftCardIds.includes(c.id)),
      draftCardIds: [],
      newCardId: null,
    })),

  addCard: (type, day) => {
    // 해당 day의 맨 뒤에 붙도록 order 계산
    const { cards } = get();
    const dayCards = cards.filter((c) => c.day === day);
    const order = dayCards.length + 1;

    const base = { id: crypto.randomUUID(), day, order };

    let newCard: PlanCardData;
    if (type === 'CHECKLIST') {
      newCard = {
        ...base,
        type: 'CHECKLIST',
        checklistItems: [{ id: crypto.randomUUID(), text: '', checked: false }],
      };
    } else if (type === 'MEMO') {
      newCard = { ...base, type: 'MEMO', desc: '', times: null };
    } else {
      newCard = { ...base, type: 'PLACE' };
    }

    // newCardId로 표시해 PlanTimelineCard가 편집 모드로 열도록 함.
    // draft 단계에서는 Ably/DB에 반영하지 않음 (isDirty·push 없음) →
    // 취소 시 다른 참가자 화면에 빈 카드가 깜빡이지 않도록 저장(확인) 시점까지 미룸
    set((state) => ({
      cards: [...cards, newCard],
      newCardId: newCard.id,
      // 저장 전까지는 로컬 전용이므로 draft로 등록
      draftCardIds: [...state.draftCardIds, newCard.id],
    }));
  },

  // draft를 확정 저장: 로컬 반영 + 이 시점에 Ably에 처음 생성
  commitCard: (card) => {
    set((state) => ({
      cards: state.cards.map((c) => (c.id === card.id ? card : c)),
      isDirty: true,
      // 서버에 생겼으므로 더 이상 draft가 아님
      draftCardIds: state.draftCardIds.filter((id) => id !== card.id),
    }));

    pushCardCreate(card);
  },

  // draft 취소: Ably에 올린 적 없으므로 로컬에서만 제거 (push 불필요)
  discardCard: (id) => {
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
      draftCardIds: state.draftCardIds.filter((draftId) => draftId !== id),
    }));
  },

  updateCard: (updatedCard) => {
    set((state) => {
      const exists = state.cards.some((c) => c.id === updatedCard.id);
      return {
        // id가 기존에 없으면(새 카드) 추가, 있으면 교체
        cards: exists
          ? state.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c))
          : [...state.cards, updatedCard],
        isDirty: true,
      };
    });

    // 다른 참가자에게 실시간 전파
    const { id, ...fields } = updatedCard;
    pushCardFields(id, fields);
  },

  deleteCard: (id) => {
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
      isDirty: true,
    }));

    pushCardRemove(id);
  },

  moveCardToDay: (activeId, targetDay) => {
    const { cards } = get();
    const cardToMove = cards.find((c) => c.id === activeId);
    if (!cardToMove) return;

    const sourceDay = cardToMove.day;
    const targetDayCards = cards.filter((c) => c.day === targetDay);
    const newOrder = targetDayCards.length + 1;

    // 출발지 day에 남는 카드들을 1부터 다시 매겨 order 갭 제거
    const sourceRenumber = new Map<string, number>();
    let nextOrder = 1;
    cards
      .filter((c) => c.day === sourceDay && c.id !== activeId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((c) => sourceRenumber.set(c.id, nextOrder++));

    set({
      cards: cards.map((card) => {
        if (card.id === activeId) {
          return { ...card, day: targetDay, order: newOrder };
        }
        const renumbered = sourceRenumber.get(card.id);
        return renumbered !== undefined ? { ...card, order: renumbered } : card;
      }),
      isDirty: true,
    });

    // 이동한 카드 + order가 실제로 바뀐 출발지 카드들을 단일 batch로 전파
    const reorders: { id: string; order: number }[] = [];
    sourceRenumber.forEach((order, id) => {
      const before = cards.find((c) => c.id === id)?.order;
      if (before !== order) reorders.push({ id, order });
    });
    pushCardMove({ id: activeId, day: targetDay, order: newOrder }, reorders);
  },

  reorderCardsInDay: (targetDay, activeId, overId) => {
    const { cards } = get();
    const dayCards = cards
      .filter((c) => c.day === targetDay)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const oldIndex = dayCards.findIndex((c) => c.id === activeId);
    const newIndex = dayCards.findIndex((c) => c.id === overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = arrayMove(dayCards, oldIndex, newIndex);
    const updatedDayCards = reordered.map((card, idx) => ({
      ...card,
      order: idx + 1,
    }));

    set({
      cards: cards.map((card) => {
        if (card.day === targetDay) {
          const found = updatedDayCards.find((c) => c.id === card.id);
          return found || card;
        }
        return card;
      }),
      isDirty: true,
    });

    // order가 실제로 바뀐 카드들을 단일 batch로 전파
    const changed = updatedDayCards
      .filter(
        (card) => dayCards.find((c) => c.id === card.id)?.order !== card.order,
      )
      .map((card) => ({ id: card.id, order: card.order }));
    pushCardOrders(changed);
  },

  resetIsDirty: () => set({ isDirty: false }),
}));
