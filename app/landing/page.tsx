import Image from 'next/image';
import { Header } from '@/components';

export default function LandingPage() {
  return (
    <div>
      <Header />
      <Image
        src='/images/landing_bg.webp'
        alt='Landing Image'
        width={1512}
        height={856}
        className='h-auto w-full'
      />
    </div>
  );
}
