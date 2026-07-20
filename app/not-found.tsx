'use client';

import {
  MainButton,
  Tag,
  FilterGroup,
  ProfileAvatar,
  ProfileEditModal,
  DayCard,
  PlaceListContainer,
} from '@/components';
import { type PlaceItem } from '@/components/ cards/PlaceCard';
import { type CandidatePlaceItem } from '@/components/ cards/CandidatePlaceCard';
import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import type { PlanCardData } from '@/types/plans';
import PlanEditorCard from '@/components/ cards/PlanEditorCard';

export default function NotFound() {
  // 필터 버튼용 상태값
  const [currentDay, setCurrentDay] = useState('Day 1');
  const [currentCategory, setCurrentCategory] = useState('전체');

  // 필터 버튼용 배열 - 배열 개수 만큼 생성
  const dayOptions = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
  const categoryOptions = ['전체', '숙소', '맛집', '카페', '명소', '액티비티'];

  // 프로필용 스토어와 변경 함수
  const userType = useUserStore((state) => state.userType);
  const setUserType = useUserStore((state) => state.setUserType);

  // 가고 싶은 장소 더미 데이터
  const candidatePlaces: CandidatePlaceItem[] = [
    {
      id: '1',
      name: '해운대블루라인파크',
      category: '테마/체험',
      location: '부산 해운대구',
    },
    {
      id: '2',
      name: '미피스토어 해운대점',
      category: '관광',
      location: '나만의 장소',
    },
    {
      id: '3',
      name: '국이네 낙지볶음',
      category: '식당',
      location: '부산 수영구',
    },
    {
      id: '4',
      name: '우리돼지국밥',
      category: '관광',
      location: '부산 동구',
    },
    {
      id: '5',
      name: '흰여울 문화 마을',
      category: '관광',
      location: '부산 동구',
    },
  ];

  // 장소 카드용 더미 데이터
  const samplePlaces: PlaceItem[] = [
    {
      id: '1',
      orderNumber: 1,
      name: '부산역',
      category: '관광',
      location: '부산 동구',
    },
    {
      id: '2',
      orderNumber: 2,
      name: '톤쇼우 남포점',
      category: '식당',
      location: '부산 남포동',
    },
    {
      id: '3',
      orderNumber: 3,
      name: '롯데 현대백화점 부산 본점',
      category: '쇼핑',
      location: '부산 서면동',
    },
    {
      id: '4',
      orderNumber: 4,
      name: '신라스테이 부산 해운대',
      category: '호텔',
      location: '부산 해운대구',
    },
  ];

  // 타임라인 장소 더미 데이터
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
    {
      id: '3',
      type: 'PLACE',
      placeOrderNumber: 2,
      title: '톤쇼우 남포점',
      category: '관광',
      location: '부산 동구',
      visitTime: '11:00 ~ 13:00',
      cost: '',
      memo: '캐치테이블 11시에 열림\n성공하면 먹고, 못하면 옆집ㄱㄱ',
    },
    {
      id: '4',
      type: 'MEMO',
      memo: '이따 해운대 구경하자\n여기 플리마켓 있다는데 구경하고 가자',
    },
  ]);

  const handleUpdate = (updated: PlanCardData) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDelete = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="flex flex-col gap-10 p-4">
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
        <PlanEditorCard
          dayNumber={1}
          dateText="8.8 / 토"
          cards={cards}
          onUpdateCard={handleUpdate}
          onDeleteCard={handleDelete}
        />
      </div>

      {/* 메인 버튼 */}
      <div className="p-3 border rounded-2xl">
        <h1 className="text-2xl font-bold">main 버튼</h1>
        <section className="flex flex-col gap-3 items-start">
          <h2 className="font-semibold text-main">[1] 기본 6가지 버전</h2>
          <MainButton variant="color">Button 1</MainButton>
          <MainButton variant="default">Button 2</MainButton>
          <MainButton variant="fill">Button 3</MainButton>
          <MainButton variant="emptyColor">Button 4</MainButton>
          <MainButton variant="disabled">Button 5</MainButton>
          <MainButton variant="round">Button 6</MainButton>
        </section>

        {/* 메인 버튼 - 패딩을 다르게 주입한 버전 */}
        <section className="flex flex-col gap-3 items-start">
          <h2 className="font-semibold text-main">
            [2] 패딩 다르게 주입한 버전 (상하 6px, 양옆 40px) (패딩 다르게
            주입하고 싶을때 classname을 붙여 값을 바꿔주면 됩니다)
          </h2>
          <MainButton variant="fill" className="py-1.5 px-10">
            좁고 넓은 버튼
          </MainButton>

          <MainButton variant="color" className="py-4 px-7.5">
            뚱뚱한 테두리 버튼
          </MainButton>
        </section>

        {/* 메인 버튼 - 가로폭을 길게 따로 지정한 버전 */}
        <section className="flex flex-col gap-3 items-start w-full">
          <h2 className="font-semibold text-main">
            [3] 가로폭(Width)을 길게 따로 지정한 버전(width값을 따로 지정해줄 수
            있어요)
          </h2>

          {/* 고정 가로폭 300px 지정 */}
          <MainButton variant="fill" width="300px">
            고정 가로폭 (300px)
          </MainButton>

          {/* 부모 컨테이너 너비를 100% 꽉 채우는 가로폭 지정 */}
          <MainButton variant="color" width="100%">
            전체 가로폭 (100%)
          </MainButton>
        </section>
      </div>

      {/* 필터 버튼 */}
      <div className="p-3 border rounded-2xl flex flex-col gap-6">
        <h1 className="text-2xl font-bold">FILTER 버튼</h1>

        <section className="flex flex-col gap-3 items-start w-full">
          <h2 className="font-semibold text-main">
            [1] 피그마 Day 필터 버전 (현재 선택:{' '}
            <span className="text-primary font-bold">{currentDay}</span>)
          </h2>
          <FilterGroup
            options={dayOptions}
            value={currentDay}
            onChange={setCurrentDay}
          />
        </section>

        <section className="flex flex-col gap-3 items-start w-full">
          <h2 className="font-semibold text-main">
            [2] 카테고리 다중 필터 확장 테스트 (현재 선택:{' '}
            <span className="text-primary font-bold">{currentCategory}</span>)
          </h2>
          <FilterGroup
            options={categoryOptions}
            value={currentCategory}
            onChange={setCurrentCategory}
          />
        </section>
      </div>

      {/* 프로필 */}
      <div className="p-3 border rounded-2xl flex flex-col gap-6">
        <h1 className="text-2xl font-bold">회원가입 유형별 Profile 테스트</h1>

        {/* 가상 설문조사 조작 구역 */}
        <section className="flex flex-col gap-3 items-start bg-color-primary-light/30 p-4 rounded-xl border border-primary/20">
          <h2 className="font-semibold text-main">
            [1] 가상 설문조사 완료 상태 선택 (Zustand 연동)
          </h2>
          <p className="text-xs text-sub">
            버튼을 클릭하면 전역 상태가 바뀌며 프로필 사진이 실시간으로
            변경됩니다.
          </p>

          <div className="flex gap-2 mt-2">
            <MainButton
              variant={userType === 'KAPI' ? 'fill' : 'default'}
              onClick={() => setUserType('KAPI')}
            >
              카피 선택
            </MainButton>
            <MainButton
              variant={userType === 'BALA' ? 'fill' : 'default'}
              onClick={() => setUserType('BALA')}
            >
              바라 선택
            </MainButton>
          </div>
        </section>

        {/* 실시간 반영 결과 구역 */}
        <section className="flex flex-col gap-4 items-start">
          <h2 className="font-semibold text-main">
            [2] Zustand 상태 반영 결과 (현재 적용된 유저 프로필)
          </h2>
          <div className="flex items-center gap-4 bg-white p-3 border rounded-xl shadow-xs">
            {/* 상태에 따른 원형 프로필 */}
            <ProfileAvatar />
            <div>
              <Tag>{userType === 'KAPI' ? '카피' : '바라'}</Tag>
            </div>
          </div>
        </section>

        {/* 다양한 크기 제공 예시 */}
        <section className="flex flex-col gap-3 items-start">
          <h2 className="font-semibold text-main">
            [3] 크기(Size) 바리에이션 고정 배치 테스트
          </h2>
          <div className="flex items-end gap-6">
            <div className="flex flex-col items-center gap-1">
              <ProfileAvatar size={40} />
              <span className="text-[10px] text-muted">헤더용</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ProfileAvatar size={24} />
              <span className="text-[10px] text-muted">카드용</span>
            </div>
          </div>
        </section>
      </div>

      {/* 마이페이지 프로필 수정 */}
      <div className="p-3 border rounded-2xl flex flex-col gap-6 items-start">
        <h1 className="text-2xl font-bold">마이페이지 프로필 변경 UI</h1>
        <ProfileEditModal />
      </div>

      <div className="w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-main">
          여행 일정 Day 카드 테스트
        </h1>

        {/* Day 1 카드 출력 */}
        <DayCard dayNumber={1} dateText="8.8 (토)" places={samplePlaces} />
      </div>

      <div className="p-6 bg-gray-100 flex flex-col gap-6">
        <h1 className="text-xl font-bold">후보 장소 리스트 테스트</h1>

        {/* 장소 리스트 컴포넌트 */}
        <PlaceListContainer
          places={candidatePlaces}
          onAddClick={() => alert('장소 추가 모달을 엽니다!')}
        />
      </div>
    </div>
  );
}
