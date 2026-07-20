import { Tag, MainButton } from '@/components';
import { SquareCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function TravelTestResultCard({
  result,
  totalCapi,
  totalBara,
}: {
  result: 'capi' | 'bara';
  totalCapi: number;
  totalBara: number;
}) {
  const resultDataMap = {
    capi: {
      title: '카피',
      color: 'primary',
      textColor: 'text-primary',
      borderColor: 'border-primary',
      buttonClassName: 'bg-primary text-primary-light',
      description: (
        <>
          느긋하게 돌아다니는 걸 좋아하는 당신,
          <br />
          낭만이 넘치는 여행자군요!
        </>
      ),
      style: [
        '숨겨진 명소나 현지 시장 등 소박한 경험에서 행복을 느끼는 타입이에요.',
        '계획대로 되지 않아도 스트레스를 받지 않고 새로운 경험을 즐겨요.',
        '얘기치 않은 문제 상황에서도 유연하게 해결책을 찾을 수 있어요.',
        '시간 확인과 예산을 잘 확인해야 해요.',
      ],
    },
    bara: {
      title: '바라',
      color: 'pink',
      // textColor: 'text-pink',
      // borderColor: 'border-pink',
      // buttonClassName: 'bg-pink text-pink-light',
      description: (
        <>
          꼼꼼한 계획을 세우는 걸 좋아하는 당신,
          <br />
          최고의 여행을 다니는 여행자군요!
        </>
      ),
      style: [
        '여행 전 일정과 동선을 꼼꼼하게 계획하는 것을 좋아하는 타입이에요.',
        '시간과 예산을 미리 관리해 효율적으로 여행을 즐겨요.',
        '예약이나 준비물을 빠짐없이 챙겨 예상치 못한 상황을 줄여요.',
        '계획에 맞춰 움직이되, 필요한 순간에는 유연하게 일정을 조정할 수 있어요.',
      ],
    },
  };
  const resultData =
    result === 'capi' ? resultDataMap.capi : resultDataMap.bara;

  const total = totalCapi + totalBara;
  const baraPercent = total === 0 ? 50 : (totalBara / total) * 100;

  return (
    <div className='flex flex-col items-center gap-8 w-150 h-fit'>
      <Image
        src={`/images/${result}1.webp`}
        width={120}
        height={145}
        alt={result}
        className={`${result === 'capi' ? '' : '-scale-x-100'}`}
      />
      <Tag
        color={`${resultData.color}-light` as 'primary-light' | 'pink-light'}
      >
        당신의 여행 유형은
      </Tag>
      <div className='text-center font-jalnan text-[32px] text-brown-light'>
        <span className={resultData.color}>
          &ldquo;{resultData.title}&rdquo;
        </span>
        타입 여행자
      </div>
      <div className='leading-[1.7] text-center text-brown'>
        {resultData.description}
      </div>
      <div className='w-full h-px bg-border'></div>

      <div className='w-full'>
        <div className='font-jalnan text-[20px] text-brown-light w-full'>
          성향 그래프
        </div>
        <div className='w-full'>
          <div className='w-full mt-5 mb-2 flex justify-between items-center text-sm text-sub'>
            <div>느긋형</div>
            <div>꼼꼼형</div>
          </div>
          <div className='relative w-full h-3 rounded-full bg-linear-to-r from-primary to-pink'>
            <div className='absolute left-1/2 top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-white/70'></div>
            <div
              className={`absolute top-0 h-3 w-3 -translate-x-1/2 rounded-full border border-${resultData.color} bg-white`}
              style={{ left: `${baraPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className='w-full'>
        <div className='font-jalnan text-[20px] text-brown-light mb-5'>
          여행 스타일
        </div>
        <div className='flex flex-col gap-2 w-full'>
          {resultData.style.map((s) => (
            <div key={s} className='flex items-center gap-2'>
              <SquareCheck className='w-3.5 h-3.5 text-brown' />
              <span className='text-brown text-[14px]'>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className='w-full rounded-[10px] border border-caramel px-7.5 py-5 bg-caramel-light flex gap-6 items-center'>
        <Image
          src={`/images/${result === 'capi' ? 'bara' : 'capi'}1.webp`}
          width={60}
          height={60}
          alt={result}
          className={`w-15 h-13 object-cover object-top ${result === 'capi' ? '-scale-x-100' : ''}`}
        />
        <div className='font-sans text-brown-light text-[14px] leading-normal pt-1'>
          <span className='font-bold'>
            &ldquo;{result === 'capi' ? '바라' : '카피'}&rdquo;형과 함께
            여행하면 서로의 빈틈을 잘 채워줘요
          </span>
          <br />
          계획은 카피가, 재미는 바라가!
        </div>
      </div>
      <div className='flex gap-2.5'>
        <MainButton variant='default' className='font-jalnan' width='140px'>
          다시하기
        </MainButton>
        <Link href='/main'>
          <MainButton
            variant={result === 'capi' ? 'fill' : 'pinkFill'}
            className='font-jalnan'
            width='140px'
          >
            여행가기!
          </MainButton>
        </Link>
      </div>
    </div>
  );
}
