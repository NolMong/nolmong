'use client';

import { useEffect, useRef } from 'react';
import { useKakaoLoader } from '@/hooks/useKakaoLoader';
import { cn } from '@/lib/utils';

interface KakaoMapProps {
  /** 지도 중심 좌표 (기본값: 부산역) */
  center?: { lat: number; lng: number };
  /** 확대 레벨 (숫자가 작을수록 확대) */
  level?: number;
  className?: string;
}

// 부산역
const DEFAULT_CENTER = { lat: 35.115141, lng: 129.041744 };

export default function KakaoMap({
  center = DEFAULT_CENTER,
  level = 5,
  className,
}: KakaoMapProps) {
  const { loaded, error } = useKakaoLoader();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);

  // 최초 로드 시 지도 인스턴스 생성
  useEffect(() => {
    if (!loaded || !containerRef.current || mapRef.current) return;

    const { kakao } = window;
    mapRef.current = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
  }, [loaded, center.lat, center.lng, level]);

  // center 변경 시 중심 이동
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter(
      new window.kakao.maps.LatLng(center.lat, center.lng)
    );
  }, [center.lat, center.lng]);

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-sm text-muted',
          className
        )}
      >
        지도를 불러오지 못했습니다.
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
