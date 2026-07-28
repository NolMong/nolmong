'use client';

import type { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
}

// 화면에 처음 들어올 때 아래에서 위로 살짝 올라오며 페이드인.
// 스크롤로 다시 나갔다 들어와도 재발동하지 않음 (섹션/카드 진입 애니메이션용)
//
// opacity/transform은 inline style로만 다룬다. 다 보이고 나면(inView) transform을
// 아예 지워버려서, className으로 넘어온 hover:-translate-y-* 같은 Tailwind 클래스가
// (같은 transform 속성을 두고) 항상 지는 문제 없이 정상적으로 먹게 한다.
export default function Reveal({ children, className, delay = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? undefined : 'translateY(2rem)',
        transition:
          'opacity 0.7s ease-out, transform 0.7s ease-out, box-shadow 0.3s ease-out',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
