'use client';

import { useEffect, useState } from 'react';

const SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;

// 스크립트 로드는 앱 전체에서 한 번만. 진행 중인 Promise를 모듈 스코프에 캐싱해 중복 로드를 막는다.
let loaderPromise: Promise<void> | null = null;

function loadKakaoSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.kakao?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-sdk]'
    );

    const handleLoad = () => window.kakao.maps.load(() => resolve());

    if (existing) {
      existing.addEventListener('load', handleLoad, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.dataset.kakaoSdk = 'true';
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', () => {
      loaderPromise = null;
      reject(new Error('카카오맵 SDK 로드에 실패했습니다.'));
    });
    document.head.appendChild(script);
  });

  return loaderPromise;
}

/** 카카오맵 SDK 로드 완료 여부를 반환. 여러 지도 컴포넌트에서 호출해도 SDK는 한 번만 로드된다. */
export function useKakaoLoader() {
  const [loaded, setLoaded] = useState(
    () => typeof window !== 'undefined' && !!window.kakao?.maps
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (loaded) return;

    let cancelled = false;
    loadKakaoSdk()
      .then(() => !cancelled && setLoaded(true))
      .catch((err) => !cancelled && setError(err));

    return () => {
      cancelled = true;
    };
  }, [loaded]);

  return { loaded, error };
}
