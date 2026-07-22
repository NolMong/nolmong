"use client";

import {
  DayCard,
  FilterGroup,
  KakaoMap,
  MainButton,
  PlaceListContainer,
  PlanEditorCard,
} from "@/components";
import { CandidatePlaceItem } from "@/components/cards/CandidatePlaceCard";
import { PlaceItem } from "@/components/cards/PlaceCard";
import { usePlanTabStore } from "@/store/usePlanTabStore";
import { PlanCardData } from "@/types/plans";
import { LucideEdit3 } from "lucide-react";
import { useState } from "react";

const candidatePlaces: CandidatePlaceItem[] = [
  {
    id: "1",
    name: "해운대블루라인파크",
    category: "테마/체험",
    location: "부산 해운대구",
  },
  {
    id: "2",
    name: "미피스토어 해운대점",
    category: "관광",
    location: "나만의 장소",
  },
  {
    id: "3",
    name: "국이네 낙지볶음",
    category: "식당",
    location: "부산 수영구",
  },
  {
    id: "4",
    name: "우리돼지국밥",
    category: "관광",
    location: "부산 동구",
  },
  {
    id: "5",
    name: "흰여울 문화 마을",
    category: "관광",
    location: "부산 동구",
  },
];

const samplePlaces: PlaceItem[] = [
  {
    id: "1",
    orderNumber: 1,
    name: "부산역",
    category: "관광",
    location: "부산 동구",
  },
  {
    id: "2",
    orderNumber: 2,
    name: "톤쇼우 남포점",
    category: "식당",
    location: "부산 남포동",
  },
  {
    id: "3",
    orderNumber: 3,
    name: "롯데 현대백화점 부산 본점",
    category: "쇼핑",
    location: "부산 서면동",
  },
  {
    id: "4",
    orderNumber: 4,
    name: "신라스테이 부산 해운대",
    category: "호텔",
    location: "부산 해운대구",
  },
  {
    id: "5",
    orderNumber: 4,
    name: "신라스테이 부산 해운대",
    category: "호텔",
    location: "부산 해운대구",
  },
  {
    id: "6",
    orderNumber: 4,
    name: "신라스테이 부산 해운대",
    category: "호텔",
    location: "부산 해운대구",
  },
];

const dayOptions = ["Day 1", "Day 2", "Day 3"];

export default function PlanPage() {
  const { activePlanTab, setPlanTab } = usePlanTabStore();
  const [currentDay, setCurrentDay] = useState("Day 1");

  const [cards, setCards] = useState<PlanCardData[]>([
    {
      id: "1",
      type: "CHECKLIST",
      checklistItems: [
        { id: "c1", text: "기차 티켓 확인", checked: true },
        {
          id: "c2",
          text: "렌터카 인수 확인 및 운전면허증 지참",
          checked: false,
        },
      ],
    },
    {
      id: "2",
      type: "PLACE",
      placeOrderNumber: 1,
      title: "부산역",
      category: "관광",
      location: "부산 동구",
      visitTime: "12:29 ~ 12:50",
      cost: "150,900원 (1인 50,300원)",
      memo: "가지전에 탑승권 뽑고 가서 역무원에게 문의해야함.",
    },
    {
      id: "3",
      type: "PLACE",
      placeOrderNumber: 2,
      title: "톤쇼우 남포점",
      category: "관광",
      location: "부산 동구",
      visitTime: "11:00 ~ 13:00",
      cost: "",
      memo: "캐치테이블 11시에 열림\n성공하면 먹고, 못하면 옆집ㄱㄱ",
    },
    {
      id: "4",
      type: "MEMO",
      memo: "이따 해운대 구경하자\n여기 플리마켓 있다는데 구경하고 가자",
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
      {/* 타이틀 + 메뉴 탭 */}
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
            variant={activePlanTab === "WISHLIST" ? "lightFill" : "default"}
            className="py-2 px-4"
            onClick={() => setPlanTab("WISHLIST")}
          >
            가고 싶은 곳
          </MainButton>
          <MainButton
            variant={activePlanTab === "PLAN_DETAILS" ? "lightFill" : "default"}
            className="py-2 px-4"
            onClick={() => setPlanTab("PLAN_DETAILS")}
          >
            상세 계획
          </MainButton>
        </div>
      </div>

      {activePlanTab === "PLAN_DETAILS" ? (
        <div className="flex gap-5 h-161">
          <div className="flex flex-col gap-5 h-full min-h-0 w-107.5">
            <FilterGroup
              options={dayOptions}
              value={currentDay}
              onChange={setCurrentDay}
            />
            <PlanEditorCard
              dayNumber={1}
              dateText="8.8 / 토"
              cards={cards}
              onUpdateCard={handleUpdate}
              onDeleteCard={handleDelete}
            />
          </div>
          <KakaoMap className="flex-1 h-full rounded-xl overflow-hidden border" />
        </div>
      ) : (
        <>
          <div className="flex gap-5 h-117 overflow-x-scroll scrollbar-none [&::-webkit-scrollbar]:hidden">
            <DayCard dayNumber={1} dateText="8.8 (토)" places={samplePlaces} />
            <DayCard dayNumber={2} dateText="8.8 (토)" places={samplePlaces} />
            <DayCard dayNumber={3} dateText="8.8 (토)" places={samplePlaces} />
          </div>

          <div>
            <PlaceListContainer places={candidatePlaces}></PlaceListContainer>
          </div>
        </>
      )}
    </main>
  );
}
