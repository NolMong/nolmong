'use client';

import Image from 'next/image';
import { Header, Tag } from '@/components';
import { CalendarDays, Map, Sheet, type LucideIcon } from 'lucide-react';
import { useLoginModalStore } from '@/store/useLoginModalStore';

const features: {
  icon: LucideIcon;
  bg: string;
  iconColor: string;
  title: string;
  description: React.ReactNode;
}[] = [
  {
    icon: CalendarDays,
    bg: 'bg-primary-light',
    iconColor: 'text-primary',
    title: '자유롭게 계획을 세워요',
    description: (
      <>
        링크를 통해 친구를 초대하면
        <br />
        언제든지 실시간으로 계획을
        <br />
        같이 세울 수 있어요!
      </>
    ),
  },
  {
    icon: Map,
    bg: 'bg-[#F1FAFF]',
    iconColor: 'text-[#8cd3fa]',
    title: '지도에서 한번에 경로 확인',
    description: (
      <>
        방문할 장소를 저장하면
        <br />
        지도에 숫자 핀이 찍혀
        <br />
        경로를 한눈에 볼 수 있어요!
      </>
    ),
  },
  {
    icon: Sheet,
    bg: 'bg-pink-light',
    iconColor: 'text-pink',
    title: '나만의 여행 성향',
    description: (
      <>
        간단한 테스트로
        <br />내 여행 성향을 알 수 있어요!
      </>
    ),
  },
];

const characters: {
  name: string;
  tagLabel: string;
  tagColor?: 'primary' | 'primary-light' | 'gray' | 'pink';
  borderColor: string;
  dotColor: string;
  description: React.ReactNode;
  traits: string[];
}[] = [
  {
    name: '카피',
    tagLabel: '느긋형',
    borderColor: 'border-primary',
    dotColor: 'bg-primary',
    description: (
      <>
        그때그때 마음가는 대로 느긋한 여행을 즐기는 카피바라에요.
        <br />
        항상 손이 바쁜 바라의 짐을 들어준답니다.
      </>
    ),
    traits: [
      '걷다가 마음에 듣는 골목을 발견하면 냅다 들어가봐요.',
      '문제가 생겨도 It’s OK! 무한한 긍정 파워를 가지고 있어요.',
      '항상 계획을 짜어오는 바라에게 고마워하고 있어요.',
    ],
  },
  {
    name: '바라',
    tagLabel: '꼼꼼형',
    tagColor: 'pink',
    borderColor: 'border-pink',
    dotColor: 'bg-pink',
    description: (
      <>
        가방도 미리 챙기고 계획도 꼼꼼하게 세우는 카피바라에요.
        <br />
        사실 여행보다 계획 세우는걸 더 좋아하는 거일지도..?
      </>
    ),
    traits: [
      '여행 한 달 전부터 일정표를 만들어요.',
      '엄청난 정보력! 바라가 찾은 맛집은 항상 맛있어요!',
      '카피를 최고의 여행 파트너라고 생각하고 있어요.',
    ],
  },
];

export default function LandingPage() {
  const openLoginModal = useLoginModalStore((state) => state.open);

  return (
    <div>
      {/* <Header /> */}
      {/* 랜딩 이미지 */}
      <div className='relative'>
        <Image
          src='/images/landing_bg.webp'
          alt='Landing Image'
          width={1512}
          height={856}
          className='h-auto w-full'
          loading='eager'
        />
        <Image
          src='/images/capi1.webp'
          alt='Capi Image'
          width={222}
          height={295}
          loading='eager'
          className='absolute bottom-[-10%] left-[10%] w-[14.68%] h-auto -translate-y-1/2'
        />
        <Image
          src='/images/bara1.webp'
          alt='Bara Image'
          width={222}
          height={295}
          loading='eager'
          className='absolute bottom-[-10%] left-[27%] w-[14.68%] h-auto -translate-y-1/2'
        />
      </div>

      {/* 첫번째 카드 */}
      <div className='box bg-primary-light w-full py-15 font-jalnan'>
        <div className='mb-4 text-2xl text-center text-primary-focus'>
          공동 여행 계획 서비스
        </div>
        <div className='text-center text-4xl text-primary leading-[1.4]'>
          친구들과 함께 여행 계획을
          <br />
          세워보세요!
        </div>
        {/* 나중에 화면 캡쳐해서 쓸거임 */}
      </div>
      {/* 두번째 카드 */}
      <div className='box bg-white w-full py-15 font-jalnan'>
        <div className='text-center text-4xl text-sub'>이런걸 도와드려요</div>

        <div className='w-fit flex gap-7.5 mx-auto mt-15'>
          {features.map(({ icon: Icon, bg, iconColor, title, description }) => (
            <div
              key={title}
              className={`box w-80 h-72 rounded-[20px] px-10 py-7.5 ${bg} flex flex-col items-center gap-5`}
            >
              <div className='w-14 h-14 bg-white rounded-full flex items-center justify-center'>
                <Icon className={`w-8 h-8 ${iconColor}`} />
              </div>
              <div className='text-[20px] text-center text-sub'>{title}</div>
              <div className='font-sans font-normal text-center text-sub'>
                {description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 세번째 카드 */}
      <div className='box bg-caramel-light w-full py-15 font-jalnan'>
        <div className='mb-4 text-2xl text-center text-brown'>
          공동 여행 계획 서비스
        </div>
        <div className='mb-4 text-center text-4xl text-caramel'>
          카피 & 바라를 소개합니다
        </div>
        <div className='font-sans font-normal text-center text-brown'>
          서로 다른 여행 스타일을 가진 두 친구, 당신은 누구와 더 닮았나요?
        </div>
        <div className='flex gap-4 justify-center mt-15'>
          <Image
            src='/images/capi2.webp'
            alt='Capi Image'
            width={222}
            height={295}
            loading='eager'
          />
          <Image
            src='/images/bara2.webp'
            alt='Bara Image'
            width={222}
            height={295}
            loading='eager'
          />
        </div>
        <div>
          <div className='flex gap-15 mt-15 mx-auto w-fit'>
            {characters.map((c) => (
              <div
                key={c.name}
                className={`box rounded-[20px] border ${c.borderColor} w-fit bg-white p-7.5`}
              >
                <div className='flex gap-2 items-center'>
                  <div className='text-brown-light text-xl my-2'>{c.name}</div>
                  <Tag color={c.tagColor}>{c.tagLabel}</Tag>
                </div>

                <div className='font-normal text-brown-light leading-[1.4] font-sans text-sm mb-5'>
                  {c.description}
                </div>
                <div className='flex flex-col gap-1 font-sans'>
                  {c.traits.map((trait) => (
                    <div key={trait} className='flex gap-2 items-center'>
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${c.dotColor}`}
                      ></div>
                      <div className='text-muted text-sm'>{trait}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={openLoginModal}
            className='text-white text-xl bg-caramel px-14 py-4 rounded-full mt-10 block w-fit mx-auto'
          >
            나는 카피? 바라? 테스트 해보기
          </button>
        </div>
      </div>
    </div>
  );
}
