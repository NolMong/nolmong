import { create } from "zustand";
import { PlanCardData, PlanCardType } from "@/types/plans";
import { arrayMove } from "@dnd-kit/sortable";
import {
  pushCardCreate,
  pushCardFields,
  pushCardRemove,
} from "@/lib/ably/planObject";

// 임의로 생성한 더미데이터. 데이터 연결할때 삭제하면 됩니다.
const initialCards: PlanCardData[] = [
  // 후보 장소 리스트 (day: "")
  {
    id: "cand-1",
    day: "",
    order: 1,
    type: "PLACE",
    name: "해운대블루라인파크",
    category: "테마/체험",
    address: "부산 해운대구 달맞이길 116",
    x: 129.178,
    y: 35.158,
  },
  {
    id: "cand-2",
    day: "",
    order: 2,
    type: "PLACE",
    name: "미피스토어 해운대점",
    category: "관광",
    address: "나만의 장소",
    x: 129.16,
    y: 35.161,
  },
  {
    id: "cand-3",
    day: "",
    order: 3,
    type: "PLACE",
    name: "국이네 낙지볶음",
    category: "식당",
    address: "부산 수영구 연수로 410",
    x: 129.112,
    y: 35.17,
  },

  // --- day 1 데이터 (day: 'day-1') ---
  {
    id: "card-1",
    day: "day-1",
    order: 1,
    type: "CHECKLIST",
    checklistItems: [
      { id: "c1", text: "기차 티켓 확인", checked: true },
      { id: "c2", text: "렌터카 인수 확인 및 운전면허증 지참", checked: false },
    ],
  },
  {
    id: "card-2",
    day: "day-1",
    order: 2,
    type: "PLACE",
    name: "부산역",
    category: "관광",
    address: "부산 동구 중앙대로 206",
    x: 129.041,
    y: 35.115,
    times: ["12:29", "12:50"],
    expense: 150900,
    desc: "가기 전에 탑승권 뽑고 역무원에게 문의",
  },
  {
    id: "card-3",
    day: "day-1",
    order: 3,
    type: "MEMO",
    times: ["13:00", "13:30"],
    desc: "부산역 근처 카페에서 일정 점검 및 커피 한 잔",
  },
  {
    id: "card-4",
    day: "day-1",
    order: 4,
    type: "PLACE",
    name: "톤쇼우 남포점",
    category: "식당",
    address: "부산 남포동",
    x: 129.032,
    y: 35.098,
    times: ["13:30", "15:00"],
    expense: 35000,
    desc: "캐치테이블 현장 대기 등록 필수!",
  },
];

interface PlanState {
  title: string;
  cards: PlanCardData[];
  isDirty: boolean; // 자동 저장 감지
  newCardId: string | null; // 방금 추가돼 편집 모드로 열려야 하는 카드 id

  // 타이틀 관련 (수신/수정 공용 — Ably 쓰기는 편집 저장 시점에 별도 처리)
  setTitle: (title: string) => void;
  // 카드 관련
  setCards: (cards: PlanCardData[]) => void;
  addCard: (type: PlanCardType, day: string) => void;
  clearNewCard: () => void;
  updateCard: (updatedCard: PlanCardData) => void;
  deleteCard: (id: string) => void;
  moveCardToDay: (activeId: string, targetDay: string) => void;
  reorderCardsInDay: (
    targetDay: string | null,
    activeId: string,
    overId: string,
  ) => void;
  resetIsDirty: () => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  title: "",
  cards: [],
  isDirty: false,
  newCardId: null,

  setTitle: (title) => set({ title }),
  // 수신(에코 포함)이 로컬 변경의 isDirty를 씻지 않도록 cards만 교체
  setCards: (cards) => set({ cards }),

  clearNewCard: () => set({ newCardId: null }),

  addCard: (type, day) => {
    // 해당 day의 맨 뒤에 붙도록 order 계산
    const { cards } = get();
    const dayCards = cards.filter((c) => c.day === day);
    const order = dayCards.length + 1;

    const base = { id: crypto.randomUUID(), day, order };

    let newCard: PlanCardData;
    if (type === "CHECKLIST") {
      newCard = {
        ...base,
        type: "CHECKLIST",
        checklistItems: [
          { id: crypto.randomUUID(), text: "", checked: false },
        ],
      };
    } else if (type === "MEMO") {
      newCard = { ...base, type: "MEMO", desc: "", times: null };
    } else {
      newCard = { ...base, type: "PLACE" };
    }

    // newCardId로 표시해 PlanTimelineCard가 편집 모드로 열도록 함
    set({ cards: [...cards, newCard], isDirty: true, newCardId: newCard.id });

    // 다른 참가자에게 실시간 전파
    pushCardCreate(newCard);
  },

  updateCard: (updatedCard) => {
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === updatedCard.id ? updatedCard : c,
      ),
      isDirty: true,
    }));

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

    // 이동한 카드 + order가 실제로 바뀐 출발지 카드들을 실시간 전파
    pushCardFields(activeId, { day: targetDay, order: newOrder });
    sourceRenumber.forEach((order, id) => {
      const before = cards.find((c) => c.id === id)?.order;
      if (before !== order) pushCardFields(id, { order });
    });
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

    // order가 실제로 바뀐 카드만 실시간 전파
    updatedDayCards.forEach((card) => {
      const before = dayCards.find((c) => c.id === card.id);
      if (before?.order !== card.order) {
        pushCardFields(card.id, { order: card.order });
      }
    });
  },

  resetIsDirty: () => set({ isDirty: false }),
}));
