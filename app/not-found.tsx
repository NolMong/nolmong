'use client';

// import MainButton from '@/components/common/MainButton';
// import Tag from '@/components/common/Tag';
// import FilterGroup from '@/components/common/FilterGroup';
import { MainButton, Tag, FilterGroup } from '@/components';
import { useState } from 'react';

export default function NotFound() {
  // 필터 버튼용 상태값
  const [currentDay, setCurrentDay] = useState('Day 1');
  const [currentCategory, setCurrentCategory] = useState('전체');

  // 필터 버튼용 배열 - 배열 개수 만큼 생성
  const dayOptions = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
  const categoryOptions = ['전체', '숙소', '맛집', '카페', '명소', '액티비티'];

  return (
    <div className='flex flex-col gap-10 p-4'>
      {/* 메인 버튼 */}
      <div className='p-3 border rounded-2xl'>
        <h1 className='text-2xl font-bold'>main 버튼</h1>
        <section className='flex flex-col gap-3 items-start'>
          <h2 className='font-semibold text-main'>[1] 기본 6가지 버전</h2>
          <MainButton variant='color'>Button 1</MainButton>
          <MainButton variant='default'>Button 2</MainButton>
          <MainButton variant='fill'>Button 3</MainButton>
          <MainButton variant='emptyColor'>Button 4</MainButton>
          <MainButton variant='disabled'>Button 5</MainButton>
          <MainButton variant='round'>Button 6</MainButton>
        </section>

        {/* 메인 버튼 - 패딩을 다르게 주입한 버전 */}
        <section className='flex flex-col gap-3 items-start'>
          <h2 className='font-semibold text-main'>
            [2] 패딩 다르게 주입한 버전 (상하 6px, 양옆 40px) (패딩 다르게
            주입하고 싶을때 classname을 붙여 값을 바꿔주면 됩니다)
          </h2>
          <MainButton variant='fill' className='py-1.5 px-10'>
            좁고 넓은 버튼
          </MainButton>

          <MainButton variant='color' className='py-4 px-7.5'>
            뚱뚱한 테두리 버튼
          </MainButton>
        </section>

        {/* 메인 버튼 - 가로폭을 길게 따로 지정한 버전 */}
        <section className='flex flex-col gap-3 items-start w-full'>
          <h2 className='font-semibold text-main'>
            [3] 가로폭(Width)을 길게 따로 지정한 버전(width값을 따로 지정해줄 수
            있어요)
          </h2>

          {/* 고정 가로폭 300px 지정 */}
          <MainButton variant='fill' width='300px'>
            고정 가로폭 (300px)
          </MainButton>

          {/* 부모 컨테이너 너비를 100% 꽉 채우는 가로폭 지정 */}
          <MainButton variant='color' width='100%'>
            전체 가로폭 (100%)
          </MainButton>
        </section>
      </div>

      {/* 필터 버튼 */}
      <div className='p-3 border rounded-2xl flex flex-col gap-6'>
        <h1 className='text-2xl font-bold'>FILTER 버튼</h1>

        <section className='flex flex-col gap-3 items-start w-full'>
          <h2 className='font-semibold text-main'>
            [1] 피그마 Day 필터 버전 (현재 선택:{' '}
            <span className='text-primary font-bold'>{currentDay}</span>)
          </h2>
          <FilterGroup
            options={dayOptions}
            value={currentDay}
            onChange={setCurrentDay}
          />
        </section>

        <section className='flex flex-col gap-3 items-start w-full'>
          <h2 className='font-semibold text-main'>
            [2] 카테고리 다중 필터 확장 테스트 (현재 선택:{' '}
            <span className='text-primary font-bold'>{currentCategory}</span>)
          </h2>
          <FilterGroup
            options={categoryOptions}
            value={currentCategory}
            onChange={setCurrentCategory}
          />
        </section>
      </div>
    </div>
  );
}
