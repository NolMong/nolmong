'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { TravelTestCard } from '@/components';
import { useSearchParams } from 'next/navigation';

const text = [
  <div key={0}>
    <span className="text-caramel">놀멍</span>에 오신 것을 환영합니다!
  </div>,
  <div key={1}>
    <span className="text-caramel">여행</span>은 사람마다 즐기는
    <br />
    방식이 조금씩 달라요.
  </div>,
  <div key={2}>
    <span className="text-caramel">5가지 질문</span>에 답해주시면
    <br />
    <span className="text-primary">카피</span>와
    <span className="text-pink"> 바라</span> 중 누구와 여행 스타일에
    <br />더 잘 맞는지 알려드릴게요
  </div>,
  <div key={3} className="text-primary">
    준비되셨나요?
  </div>,
];

export default function TravelTestPage() {
  const searchParams = useSearchParams();
  const invite = searchParams?.get('invite');
  const next = searchParams?.get('next');

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showTestCard, setShowTestCard] = useState(false);
  const [resultShown, setResultShown] = useState(false);

  useEffect(() => {
    if (showTestCard) return;
    const intervalId = setInterval(() => {
      setVisible(false);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [showTestCard]);

  useEffect(() => {
    if (visible) return;
    const timeoutId = setTimeout(() => {
      if (index === text.length - 1) {
        setShowTestCard(true);
        return;
      }
      setIndex((prev) => prev + 1);
      setVisible(true);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [visible, index, text.length]);

  return (
    <div className="w-full min-h-screen bg-caramel-light flex flex-col items-center pb-15">
      <div className="mt-20">
        <div className="bg-[#ffd17b68] w-45 h-13 rotate-4 mx-auto z-20"></div>
        <div
          className={`min-w-150 bg-white rounded-[20px] shadow-[0px_4px_10px_0px_#b5b5b540] flex flex-col items-center justify-center -mt-6.5 ${showTestCard ? 'px-7.5 pt-15 pb-7.5 gap-10' : 'px-15 pt-15 pb-10'}`}
        >
          {showTestCard ? (
            <TravelTestCard
              inviteUuid={invite ?? undefined}
              nextUrl={next ?? undefined}
              onShowResult={() => setResultShown(true)}
            />
          ) : (
            <>
              <div className="flex gap-4 items-center">
                <Image
                  src="/images/capi2.webp"
                  alt="Travel Test Image"
                  width={120}
                  height={175}
                  loading="eager"
                />
                <Image
                  src="/images/bara2.webp"
                  alt="Travel Test Image"
                  width={120}
                  height={175}
                  loading="eager"
                />
              </div>
              <div
                className={`mt-10 text-brown-light text-center text-[24px] font-jalnan transition-opacity duration-200 ${
                  visible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {text[index]}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
