import { create } from 'zustand';
import { PlanCardData } from '@/types/plans';
import { arrayMove } from '@dnd-kit/sortable';

// 임의로 생성한 더미데이터. 데이터 연결할때 삭제하면 됩니다.
const initialCards: PlanCardData[] = [
  // 후보 장소 리스트 (day: null)
  {
    id: 'cand-1',
    day: null,
    order: 1,
    type: 'PLACE',
    name: '해운대블루라인파크',
    category: '테마/체험',
    address: '부산 해운대구 달맞이길 116',
    x: 129.178,
    y: 35.158,
  },
  {
    id: 'cand-2',
    day: null,
    order: 2,
    type: 'PLACE',
    name: '미피스토어 해운대점',
    category: '관광',
    address: '나만의 장소',
    x: 129.16,
    y: 35.161,
  },
  {
    id: 'cand-3',
    day: null,
    order: 3,
    type: 'PLACE',
    name: '국이네 낙지볶음',
    category: '식당',
    address: '부산 수영구 연수로 410',
    x: 129.112,
    y: 35.17,
  },

  // --- Day 1 데이터 (day: 'Day-1') ---
  {
    id: 'card-1',
    day: 'Day-1',
    order: 1,
    type: 'CHECKLIST',
    checklistItems: [
      { id: 'c1', text: '기차 티켓 확인', checked: true },
      { id: 'c2', text: '렌터카 인수 확인 및 운전면허증 지참', checked: false },
    ],
  },
  {
    id: 'card-2',
    day: 'Day-1',
    order: 2,
    type: 'PLACE',
    name: '부산역',
    category: '관광',
    address: '부산 동구 중앙대로 206',
    x: 129.041,
    y: 35.115,
    times: ['12:29', '12:50'],
    expense: 150900,
    desc: '가기 전에 탑승권 뽑고 역무원에게 문의',
  },
  {
    id: 'card-3',
    day: 'Day-1',
    order: 3,
    type: 'MEMO',
    times: ['13:00', '13:30'],
    desc: '부산역 근처 카페에서 일정 점검 및 커피 한 잔',
  },
  {
    id: 'card-4',
    day: 'Day-1',
    order: 4,
    type: 'PLACE',
    name: '톤쇼우 남포점',
    category: '식당',
    address: '부산 남포동',
    x: 129.032,
    y: 35.098,
    times: ['13:30', '15:00'],
    expense: 35000,
    desc: '캐치테이블 현장 대기 등록 필수!',
  },
];

interface PlanState {
  cards: PlanCardData[];
  isDirty: boolean; // 자동 저장 감지

  setCards: (cards: PlanCardData[]) => void;
  updateCard: (updatedCard: PlanCardData) => void;
  deleteCard: (id: string) => void;
  moveCardToDay: (activeId: string, targetDay: string | null) => void;
  reorderCardsInDay: (
    targetDay: string | null,
    activeId: string,
    overId: string,
  ) => void;
  resetIsDirty: () => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  cards: initialCards,
  isDirty: false,

  setCards: (cards) => set({ cards, isDirty: false }),

  updateCard: (updatedCard) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === updatedCard.id ? updatedCard : c,
      ),
      isDirty: true,
    })),

  deleteCard: (id) =>
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
      isDirty: true,
    })),

  moveCardToDay: (activeId, targetDay) =>
    set((state) => {
      const cardToMove = state.cards.find((c) => c.id === activeId);
      if (!cardToMove) return state;

      const targetDayCards = state.cards.filter((c) => c.day === targetDay);
      const newOrder = targetDayCards.length + 1;

      return {
        cards: state.cards.map((card) =>
          card.id === activeId
            ? { ...card, day: targetDay, order: newOrder }
            : card,
        ),
        isDirty: true,
      };
    }),

  reorderCardsInDay: (targetDay, activeId, overId) =>
    set((state) => {
      const dayCards = state.cards
        .filter((c) => c.day === targetDay)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const oldIndex = dayCards.findIndex((c) => c.id === activeId);
      const newIndex = dayCards.findIndex((c) => c.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex)
        return state;

      const reordered = arrayMove(dayCards, oldIndex, newIndex);
      const updatedDayCards = reordered.map((card, idx) => ({
        ...card,
        order: idx + 1,
      }));

      return {
        cards: state.cards.map((card) => {
          if (card.day === targetDay) {
            const found = updatedDayCards.find((c) => c.id === card.id);
            return found || card;
          }
          return card;
        }),
        isDirty: true,
      };
    }),

  resetIsDirty: () => set({ isDirty: false }),
}));
