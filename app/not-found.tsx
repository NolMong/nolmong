'use client';

import MainButton from '@/components/MainButton';
import Tag from '@/components/Tag';

export default function NotFound() {
  return (
    <div className="flex flex-col gap-10 p-4">
      <div className="p-3 border rounded-2xl">
        <h1 className="text-2xl font-bold">main 버튼</h1>
        {/* 피그마에 있는 메인 버튼 6가지 버전 */}
        <section className="flex flex-col gap-3 items-start">
          <h2 className="font-semibold text-main">[1] 기본 6가지 버전</h2>
          <MainButton variant="color">Button 1</MainButton>
          <MainButton variant="default">Button 2</MainButton>
          <MainButton variant="fill">Button 3</MainButton>
          <MainButton variant="emptyColor">Button 4</MainButton>
          <MainButton variant="disabled">Button 5</MainButton>
          <MainButton variant="round">Button 6</MainButton>
        </section>

        {/* 패딩을 다르게 주입한 버전 */}
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

        {/* 가로폭을 길게 따로 지정한 버전 */}
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

      <div className="p-3 border rounded-2xl">
        <h1 className="text-2xl font-bold">Tag</h1>
        <section className="flex flex-col gap-3 items-start">
          <h2 className="font-semibold text-main">
            [1] 기본 태그 (피그마 D-Day 매핑)
          </h2>
          <Tag>D-12</Tag>
        </section>

        <section className="flex flex-col gap-3 items-start">
          <h2 className="font-semibold text-main">
            [2] 텍스트가 길어질 때 자율 확장 테스트
          </h2>
          <Tag>D-Day</Tag>
          <Tag>모집중</Tag>
          {/* 외부에서 폰트 크기나 패딩을 더 넓히고 싶을 때 className 주입 가능 */}
          <Tag className="text-base px-4 py-1.5">크기를 키운 커스텀 태그</Tag>
        </section>
      </div>
    </div>
  );
}
