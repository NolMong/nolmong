'use client';

import { useEffect, useRef, useState } from 'react';

// 요소가 화면에 처음 들어올 때 딱 한 번만 true로 바뀌는 훅.
// 스크롤로 다시 나갔다 들어와도 재발동하지 않음 (섹션 진입 애니메이션용)
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return { ref, inView } as const;
}
