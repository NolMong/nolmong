'use client';

import { useEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { MapPin } from 'lucide-react';
import { useKakaoLoader } from '@/hooks/useKakaoLoader';
import { cn } from '@/lib/utils';
import { PlanCardData } from '@/types/plans';

interface KakaoMapProps {
  cards?: PlanCardData[];
  currentDay?: string;
  center?: { lat: number; lng: number };
  level?: number;
  className?: string;
}

// 부산역 기본 위치
const DEFAULT_CENTER = { lat: 35.115141, lng: 129.041744 };

export default function KakaoMap({
  cards = [],
  currentDay = 'day-1',
  center = DEFAULT_CENTER,
  level = 5,
  className,
}: KakaoMapProps) {
  const { loaded, error } = useKakaoLoader();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);

  // 오버레이 및 선 보관용
  const overlaysRef = useRef<{
    customOverlays: kakao.maps.CustomOverlay[];
    polyline: kakao.maps.Polyline | null;
  }>({ customOverlays: [], polyline: null });

  // 지도 인스턴스 생성
  useEffect(() => {
    if (!loaded || !containerRef.current || mapRef.current) return;

    const { kakao } = window;
    mapRef.current = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
  }, [loaded, center.lat, center.lng, level]);

  // cards 및 currentDay 변경 시 핑/선 업데이트
  useEffect(() => {
    if (!mapRef.current || !loaded) return;
    const { kakao } = window;
    const map = mapRef.current;

    // 기존 핑 & 선 초기화
    overlaysRef.current.customOverlays.forEach((overlay) =>
      overlay.setMap(null),
    );
    if (overlaysRef.current.polyline) {
      overlaysRef.current.polyline.setMap(null);
    }
    overlaysRef.current = { customOverlays: [], polyline: null };

    // 현재 Day의 PLACE 카드만 추출 및 정렬
    const targetCards = cards
      .filter(
        (card) =>
          card.day === currentDay &&
          card.type === 'PLACE' &&
          card.x != null &&
          card.y != null,
      )
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (targetCards.length === 0) {
      map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
      return;
    }

    const linePath: kakao.maps.LatLng[] = [];
    const newOverlays: kakao.maps.CustomOverlay[] = [];
    const bounds = new kakao.maps.LatLngBounds();

    targetCards.forEach((card, index) => {
      // y가 위도, x가 경도
      const lat = Number(card.y);
      const lng = Number(card.x);
      const position = new kakao.maps.LatLng(lat, lng);

      linePath.push(position);
      bounds.extend(position);

      // 핀 그리기
      const mapPinSvg = renderToString(
        <MapPin
          size={28}
          color="#358C1C"
          fill="#358C1C"
          className="drop-shadow-md"
        />,
      );

      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
          <!-- MapPin 아이콘 -->
          ${mapPinSvg}
          <!-- 핀 중앙 숫자 -->
          <span style="position: absolute; top: 3px; width: 28px; text-align: center; color: white; font-size: 11px; font-weight: 900; pointer-events: none; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
            ${index + 1}
          </span>
        </div>
      `;

      // 핀 끝점 피봇 맞춤
      const customOverlay = new kakao.maps.CustomOverlay({
        position,
        content: markerContent,
        xAnchor: 0.5,
        yAnchor: 1.0,
      });

      customOverlay.setMap(map);
      newOverlays.push(customOverlay);
    });

    // 루트 선 생성
    const polyline = new kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 2,
      strokeColor: '#5EB445',
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
    });

    polyline.setMap(map);
    overlaysRef.current = { customOverlays: newOverlays, polyline };

    // 영역 맞춤
    map.setBounds(bounds);
  }, [loaded, cards, currentDay, center.lat, center.lng]);

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-sm text-muted',
          className,
        )}
      >
        지도를 불러오지 못했습니다.
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
