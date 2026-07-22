'use client';

import { useState } from 'react';
import { MainButton } from '@/components';
import { PlaceItem } from '@/components/cards/PlaceCard';
import { usePlanTabStore } from '@/store/usePlanTabStore';
import { PlanCardData } from '@/types/plans';
import { LucideEdit3 } from 'lucide-react';

import WishlistTab from './_components/WishlistTab';
import PlanDetailsTab from './_components/PlanDetailsTab';

export default function PlanPage() {
  const { activePlanTab, setPlanTab } = usePlanTabStore();

  // 후보 장소 데이터
  const [candidatePlaces, setCandidatePlaces] = useState<PlaceItem[]>([
    {
      id: 'cand-1',
      name: '해운대블루라인파크',
      category: '테마/체험',
      location: '부산 해운대구',
    },
    {
      id: 'cand-2',
      name: '미피스토어 해운대점',
      category: '관광',
      location: '나만의 장소',
    },
    {
      id: 'cand-3',
      name: '국이네 낙지볶음',
      category: '식당',
      location: '부산 수영구',
    },
  ]);

  // Day별 장소 데이터
  const [dayPlaces, setDayPlaces] = useState<Record<string, PlaceItem[]>>({
    'day-1': [
      {
        id: 'p-1',
        orderNumber: 1,
        name: '부산역',
        category: '관광',
        location: '부산 동구',
      },
      {
        id: 'p-2',
        orderNumber: 2,
        name: '톤쇼우 남포점',
        category: '식당',
        location: '부산 남포동',
      },
    ],
    'day-2': [],
    'day-3': [],
  });

  // 상세 계획 카드 데이터
  const [cards, setCards] = useState<PlanCardData[]>([
    {
      id: '1',
      type: 'CHECKLIST',
      checklistItems: [
        { id: 'c1', text: '기차 티켓 확인', checked: true },
        {
          id: 'c2',
          text: '렌터카 인수 확인 및 운전면허증 지참',
          checked: false,
        },
      ],
    },
    {
      id: '2',
      type: 'PLACE',
      placeOrderNumber: 1,
      title: '부산역',
      category: '관광',
      location: '부산 동구',
      visitTime: '12:29 ~ 12:50',
      cost: '150,900원 (1인 50,300원)',
      memo: '가지전에 탑승권 뽑고 가서 역무원에게 문의해야함.',
    },
  ]);

  const handleUpdate = (updated: PlanCardData) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDelete = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <main className="flex flex-col gap-7.5 min-w-300 w-300 mx-auto px-5 py-8">
      {/* 헤더 타이틀 및 탭 버튼 */}
      <div className="flex flex-col gap-5">
        <div className="flex gap-2">
          <div className="text-xl font-jalnan-gothic text-sub">
            부산 2박 3일 여행
          </div>
          <button>
            <LucideEdit3 size={14} className="text-muted" />
          </button>
        </div>

        <div className="flex gap-2">
          <MainButton
            variant={activePlanTab === 'WISHLIST' ? 'lightFill' : 'default'}
            className="py-2 px-4"
            onClick={() => setPlanTab('WISHLIST')}
          >
            가고 싶은 곳
          </MainButton>
          <MainButton
            variant={activePlanTab === 'PLAN_DETAILS' ? 'lightFill' : 'default'}
            className="py-2 px-4"
            onClick={() => setPlanTab('PLAN_DETAILS')}
          >
            상세 계획
          </MainButton>
        </div>
      </div>

      {/* 탭별 뷰 컴포넌트 렌더링 */}
      {activePlanTab === 'PLAN_DETAILS' ? (
        <PlanDetailsTab
          cards={cards}
          onUpdateCard={handleUpdate}
          onDeleteCard={handleDelete}
        />
      ) : (
        <WishlistTab
          candidatePlaces={candidatePlaces}
          setCandidatePlaces={setCandidatePlaces}
          dayPlaces={dayPlaces}
          setDayPlaces={setDayPlaces}
        />
      )}
    </main>
  );
}
