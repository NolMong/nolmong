import Image from 'next/image';
import Link from 'next/link';
import { PawPrint } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[calc(100vh-269px)] bg-[#FDF6F0]'>
      <div className='font-jalnan text-[48px] text-center mb-4 text-brown-light'>
        멍...
      </div>
      <Image
        src='/images/404.png'
        alt='Not Found'
        width={400}
        height={300}
        className='mx-auto mb-5 -mt-15'
      />

      <div className='font-jalnan text-[20px] text-center mb-1 text-caramel'>
        404ERROR
      </div>
      <div className='font-jalnan text-[24px] text-center mb-4 text-brown-light'>
        길을 잘못 들었나봐요...
      </div>
      <div className='font-regular text-center mb-4 text-brown-light leading-[1.4]'>
        찾으시는 페이지가 사라졌거나 주소가 바뀌었어요.
        <br />
        카피, 바라와 함께 다시 길을 찾아볼까요?
      </div>
      <div className='relative w-64 h-14 mx-auto mb-2'>
        <PawPrint
          size={20}
          className='absolute left-[2%] top-2 text-caramel rotate-[10deg] animate-footstep [animation-delay:0s]'
        />
        <PawPrint
          size={20}
          className='absolute left-[20%] top-6 text-caramel -rotate-[10deg] animate-footstep [animation-delay:0.35s]'
        />
        <PawPrint
          size={20}
          className='absolute left-[38%] top-1 text-caramel rotate-[10deg] animate-footstep [animation-delay:0.7s]'
        />
        <PawPrint
          size={20}
          className='absolute left-[56%] top-6 text-caramel -rotate-[10deg] animate-footstep [animation-delay:1.05s]'
        />
        <PawPrint
          size={20}
          className='absolute left-[74%] top-1 text-caramel rotate-[10deg] animate-footstep [animation-delay:1.4s]'
        />
        <PawPrint
          size={20}
          className='absolute left-[92%] top-6 text-caramel -rotate-[10deg] animate-footstep [animation-delay:1.75s]'
        />
      </div>
      <Link href='/main'>
        <div className='font-jalnan text-center mt-4 bg-primary text-primary-light border border-primary-light rounded-[8px] py-2 px-4 mx-auto w-max hover:bg-[#95CC85] hover:text-white transition-all duration-300'>
          홈으로 돌아가기
        </div>
      </Link>
    </div>
  );
}
