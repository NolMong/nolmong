'use client';

import Image from 'next/image';
import { Header, Tag, Reveal } from '@/components';
import {
  CalendarDays,
  Map,
  Sheet,
  Heart,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useLoginModalStore } from '@/store/useModalStore';
import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

const steps: { src: string; alt: string; text: string; desc: string }[] = [
  {
    src: '/images/screen2.png',
    alt: 'Screen2 Image',
    text: '여행 날짜와 위치를 정하기',
    desc: '떠나고 싶은 날짜와 여행지를 골라주세요.',
  },
  {
    src: '/images/screen3.png',
    alt: 'Screen3 Image',
    text: '여행 장소와 계획을 세우기',
    desc: `가고 싶은 장소들을 날짜마다 하나씩 담으면, 이동 순서가\n지도에 표시돼요.\n순서를 바꾸거나 장소를 더 추가해도 걱정 없어요.`,
  },
  {
    src: '/images/screen4.png',
    alt: 'Screen4 Image',
    text: '여행 준비 끝!',
    desc: '완성된 일정을 확인하고 저장하면 준비 끝!\n친구를 초대하면 함께 실시간으로 계획을 만들 수 있어요.',
  },
];

function LandingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // alert가 2번 실행되는 것을 방지하는 ref
  const hasAlertedRef = useRef(false);

  useEffect(() => {
    const isUnauthorized = searchParams?.get('unauthorized') === 'true';
    const inviteUuid = searchParams?.get('invite') || '';

    if (isUnauthorized && !hasAlertedRef.current) {
      hasAlertedRef.current = true; // 1회만 실행

      alert('로그인이 필요한 서비스입니다. 로그인을 해주세요!');

      // URL 파라미터 정리
      const nextParams = new URLSearchParams(searchParams?.toString() ?? '');
      nextParams.delete('unauthorized');
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });

      // 초대 파라미터를 포함한 Callback URL 만든 후 바로 카카오 로그인으로 넘어가기
      const targetPath = inviteUuid ? `/main?invite=${inviteUuid}` : '/main';
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetPath)}`;

      supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            scope: 'profile_nickname',
            prompt: 'login',
          },
        },
      });
    }
  }, [searchParams, router, pathname, supabase]);

  // 카피 바라 테스트 해보기 버튼 클릭 핸들러
  const handleTestBtnClick = () => {
    const inviteUuid = searchParams?.get('invite') || '';
    const targetPath = inviteUuid ? `/main?invite=${inviteUuid}` : '/main';
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetPath)}`;

    supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          scope: 'profile_nickname',
          prompt: 'login',
        },
      },
    });
  };

  return (
    <div>
      {/* <Header /> */}
      {/* 랜딩 이미지 */}
      <div className='relative'>
        <Image
          src='/images/landing_bg.png'
          alt='Landing Image'
          width={1512}
          height={856}
          className='h-auto w-full'
          loading='eager'
        />

        <Image
          src='/images/cloud1.png'
          alt='cloud1'
          width={500}
          height={50}
          className='absolute top-[20%] left-[10%] w-[24%] h-auto -translate-y-1/2'
          style={{
            animation:
              'fade-in 1.1s ease-out 0s both, float 4s ease-in-out 0s infinite backwards',
          }}
          loading='eager'
        />
        <Image
          src='/images/cloud2.png'
          alt='cloud2'
          width={300}
          height={50}
          className='absolute top-[48%] left-[3%] w-[14%] h-auto -translate-y-1/2'
          style={{
            animation:
              'fade-in 1.1s ease-out 0.05s both, float 4.6s ease-in-out 0.6s infinite backwards',
          }}
          loading='eager'
        />
        <Image
          src='/images/cloud3.png'
          alt='cloud3'
          width={300}
          height={50}
          className='absolute top-[36%] left-[38%] w-[16%] h-auto -translate-y-1/2'
          style={{
            animation:
              'fade-in 1.1s ease-out 0.08s both, float 4.2s ease-in-out 1.2s infinite backwards',
          }}
          loading='eager'
        />
        <Image
          src='/images/cloud4.png'
          alt='cloud4'
          width={1000}
          height={50}
          className='absolute top-[32%] right-[27%] w-[12%] h-auto -translate-y-1/2'
          style={{
            animation:
              'fade-in 1.1s ease-out 0.1s both, float 3.8s ease-in-out 0.3s infinite backwards',
          }}
          loading='eager'
        />
        <Image
          src='/images/cloud5.png'
          alt='cloud5'
          width={300}
          height={50}
          className='absolute top-[56%] left-[30%] w-[8%] h-auto -translate-y-1/2'
          style={{
            animation:
              'fade-in 1.1s ease-out 0.12s both, float 5s ease-in-out 0.9s infinite backwards',
          }}
          loading='eager'
        />
        <Image
          src='/images/cloud5.png'
          alt='cloud5'
          width={300}
          height={50}
          className='absolute top-[46%] right-[20%] w-[6%] h-auto -translate-y-1/2'
          style={{
            animation:
              'fade-in 1.1s ease-out 0.15s both, float 5s ease-in-out 0.9s infinite backwards',
          }}
          loading='eager'
        />
        <Image
          src='/images/capi1.png'
          alt='Capi Image'
          width={222}
          height={295}
          loading='eager'
          className='absolute bottom-[-10%] left-[12%] w-[14.68%] h-auto -translate-y-1/2 origin-bottom animate-hum'
        />
        <Image
          src='/images/bara1.png'
          alt='Bara Image'
          width={222}
          height={295}
          loading='eager'
          className='absolute bottom-[-10%] left-[30%] w-[14.68%] h-auto -translate-y-1/2 origin-bottom animate-nod'
        />
        <Image
          src='/images/title1.png'
          alt='Title1 Image'
          width={908}
          height={90}
          loading='eager'
          className='absolute top-[13%] right-[5%] w-[42%] h-auto -translate-y-1/2 animate-fade-in [animation-delay:0.15s] [animation-duration:1.1s]'
        />
        <Image
          src='/images/title2.png'
          alt='Title2 Image'
          width={908}
          height={90}
          loading='eager'
          className='absolute top-[24%] right-[5%] w-[20%] h-auto -translate-y-1/2 animate-fade-in [animation-delay:0.2s] [animation-duration:1.1s]'
        />
      </div>

      {/* 첫번째 카드 */}
      <div className='box bg-primary-light w-full py-15 font-jalnan'>
        <Reveal className='mb-4 text-2xl text-center text-primary-focus'>
          공동 여행 계획 서비스
        </Reveal>
        <Reveal
          delay={100}
          className='text-center text-4xl text-primary leading-[1.4]'
        >
          친구들과 함께 여행 계획을
          <br />
          세워보세요!
        </Reveal>

        <div className='flex flex-col gap-14 mx-auto mt-16 w-[974px]'>
          {steps.map((step, index) => (
            <Reveal
              key={step.text}
              delay={index * 120}
              className={`flex items-center gap-10 `}
            >
              <div className='relative flex items-center gap-3 shrink-0 rounded-3xl bg-white p-3 shadow-card w-full'>
                <span className='box absolute -top-4 -left-4 border-6 border-white shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-lg font-bold'>
                  {index + 1}
                </span>
                <Image
                  src={step.src}
                  alt={step.alt}
                  width={550}
                  height={295}
                  className='rounded-2xl border border-border'
                  loading='eager'
                />
                <div className='px-2 py-3 '>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='text-2xl text-primary-focus'>
                      {step.text}
                    </div>
                  </div>
                  <div className='whitespace-pre-line font-sans leading-[1.6] text-sub'>
                    {step.desc}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal
            delay={steps.length * 120}
            className='flex items-center gap-10 flex-row-reverse'
          >
            <div className='relative flex items-center gap-3 shrink-0 rounded-3xl bg-white p-3 shadow-card w-full'>
              <span className='box absolute -top-4 -left-4 border-6 border-white shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-pink text-white text-lg font-bold'>
                <Heart size={18} fill='currentColor' />
              </span>
              <Image
                src='/images/screen1.png'
                alt='Screen1 Image'
                width={550}
                height={295}
                className='rounded-2xl border border-border'
                loading='eager'
              />
              <div className='px-2 py-3 '>
                <div className='flex items-center gap-3 mb-3'>
                  <div className='text-2xl text-pink'>
                    갔다온 여행도 다시 볼 수 있어요!
                  </div>
                </div>
                <div className='whitespace-pre-line font-sans leading-[1.6] text-sub'>
                  여행이 끝난 후에도 계획을 저장해두면
                  <br />
                  언제든지 다시 확인할 수 있어요.
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      {/* 두번째 카드 */}
      <div className='box bg-white w-full py-15 font-jalnan'>
        <Reveal className='flex items-center justify-center gap-2 text-center text-4xl text-sub'>
          <Sparkles size={28} className='text-primary' />
          이런걸 도와드려요
        </Reveal>

        <div className='w-fit flex gap-7.5 mx-auto mt-15'>
          {features.map(
            ({ icon: Icon, bg, iconColor, title, description }, index) => (
              <Reveal
                key={title}
                delay={index * 120}
                className={`group/feature box w-80 h-72 rounded-2xl px-10 py-7.5 ${bg} flex flex-col items-center gap-5 cursor-default hover:-translate-y-2 hover:shadow-lg`}
              >
                <div className='w-14 h-14 bg-white rounded-full flex items-center justify-center transition-transform duration-300 group-hover/feature:scale-110 group-hover/feature:-rotate-6'>
                  <Icon className={`w-8 h-8 ${iconColor}`} />
                </div>
                <div className='text-[20px] text-center text-sub'>{title}</div>
                <div className='font-sans font-normal text-center text-sub'>
                  {description}
                </div>
              </Reveal>
            ),
          )}
        </div>
      </div>

      {/* 세번째 카드 */}
      <div className='box bg-caramel-light w-full py-15 font-jalnan'>
        <Reveal className='mb-4 text-2xl text-center text-brown'>
          공동 여행 계획 서비스
        </Reveal>
        <Reveal delay={80} className='mb-4 text-center text-4xl text-caramel'>
          카피 & 바라를 소개합니다
        </Reveal>
        <Reveal
          delay={160}
          className='font-sans font-normal text-center text-brown'
        >
          서로 다른 여행 스타일을 가진 두 친구, 당신은 누구와 더 닮았나요?
        </Reveal>
        <Reveal delay={240} className='flex gap-4 justify-center mt-15'>
          <Image
            src='/images/capi2.webp'
            alt='Capi Image'
            width={222}
            height={295}
            loading='eager'
            className='transition-transform duration-300 hover:scale-105'
          />
          <Image
            src='/images/bara2.webp'
            alt='Bara Image'
            width={222}
            height={295}
            loading='eager'
            className='transition-transform duration-300 hover:scale-105'
          />
        </Reveal>
        <div>
          <div className='flex gap-15 mt-15 mx-auto w-fit'>
            {characters.map((c, index) => (
              <Reveal
                key={c.name}
                delay={index * 150}
                className={`box rounded-2xl border ${c.borderColor} w-fit bg-white p-7.5 hover:-translate-y-2 hover:shadow-lg`}
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
              </Reveal>
            ))}
          </div>
          <button
            onClick={handleTestBtnClick}
            className='cursor-pointer text-white text-xl hover:bg-[#bc9d79] px-14 py-4 rounded-full mt-10 block w-fit mx-auto bg-caramel transition duration-200 hover:scale-105 active:scale-95'
          >
            나는 카피? 바라? 테스트 해보기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingContent />
    </Suspense>
  );
}
