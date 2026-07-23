'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { MapPin } from 'lucide-react';
import { useKakaoLoader } from '@/hooks/useKakaoLoader';
import { cn } from '@/lib/utils';
import { PlanCardData } from '@/types/plans';

export interface KakaoMapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  address?: string;
  data?: kakao.maps.services.PlacesSearchResultItem;
}

function DefaultMarkerContent({ marker }: { marker: KakaoMapMarker }) {
  return (
    <div
      style={{
        padding: '6px 10px',
        fontSize: 12,
        lineHeight: 1.4,
        maxWidth: 200,
        backgroundColor: 'white',
      }}
    >
      <div style={{ fontWeight: 600 }}>{marker.title}</div>
      {marker.address && (
        <div style={{ color: '#888', marginTop: 2 }}>{marker.address}</div>
      )}
    </div>
  );
}

// 카카오 InfoWindow는 자체 흰 박스/꼬리 테두리를 그려서 커스텀이 안 되니,
// CustomOverlay 위에 우리가 렌더링한 콘텐츠만 올리고 닫기 버튼만 얹어준다
function MarkerOverlayContent({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      // 카드 내부 클릭이 지도까지 버블링되면 지도 클릭 리스너가 오버레이를 닫아버려서 막아준다
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'relative',
        marginBottom: 42,
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0px 4px 10px rgba(82, 82, 82, 0.2)',
      }}
    >
      <button
        type='button'
        onClick={onClose}
        style={{
          position: 'absolute',
          top: -8,
          right: -8,
          width: 20,
          height: 20,
          borderRadius: '9999px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          fontSize: 12,
          lineHeight: '18px',
          cursor: 'pointer',
        }}
      >
        ×
      </button>
      {children}
    </div>
  );
}

interface KakaoMapProps {
  /** 일정에 저장된 카드 목록. currentDay의 PLACE 카드들을 핀/선으로 그린다 */
  cards?: PlanCardData[];
  /** 핀/선을 그릴 대상 day (예: 'day-1') */
  currentDay?: string;
  /** 지도 중심 좌표 (기본값: 부산역) */
  center?: { lat: number; lng: number };
  /** 확대 레벨 (숫자가 작을수록 확대) */
  level?: number;
  className?: string;
  /** 지도 위에 찍을 마커 (검색 결과 등) */
  markers?: KakaoMapMarker[];
  /** 지도 인스턴스가 생성된 직후 호출 (장소 검색 등에 사용) */
  onMapLoad?: (map: kakao.maps.Map) => void;
  /** 마커 클릭 시 오버레이 안에 렌더링할 커스텀 콘텐츠 (없으면 이름/주소 기본 표시) */
  renderMarkerContent?: (marker: KakaoMapMarker) => ReactNode;
}

// 부산역 기본 위치
const DEFAULT_CENTER = { lat: 35.115141, lng: 129.041744 };

export default function KakaoMap({
  cards = [],
  currentDay,
  center = DEFAULT_CENTER,
  level = 5,
  className,
  markers = [],
  onMapLoad,
  renderMarkerContent,
}: KakaoMapProps) {
  const { loaded, error } = useKakaoLoader();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markerInstancesRef = useRef<kakao.maps.Marker[]>([]);
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const overlayRootRef = useRef<Root | null>(null);

  // 일정 핀/선 보관용
  const overlaysRef = useRef<{
    customOverlays: kakao.maps.CustomOverlay[];
    polyline: kakao.maps.Polyline | null;
  }>({ customOverlays: [], polyline: null });

  // 최초 로드 시 지도 인스턴스 생성
  useEffect(() => {
    if (!loaded || !containerRef.current || mapRef.current) return;

    const { kakao } = window;
    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
    mapRef.current = map;

    // CustomOverlay content로 쓸 컨테이너에 React 컴포넌트를 렌더링해 넣는다
    // (InfoWindow는 카카오가 그리는 흰 박스/꼬리 테두리를 커스텀할 수 없어서 CustomOverlay를 씀)
    const overlayContainer = document.createElement('div');
    overlayRootRef.current = createRoot(overlayContainer);
    overlayRef.current = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(center.lat, center.lng),
      content: overlayContainer,
      yAnchor: 1,
      // false(기본값)면 오버레이 위 클릭이 지도로 새서 버튼 클릭이 씹힌다
      clickable: true,
    });

    // 지도 빈 곳을 클릭하면 열려 있던 오버레이를 닫는다
    kakao.maps.event.addListener(map, 'click', () => {
      overlayRef.current?.setMap(null);
    });

    onMapLoad?.(map);

    // StrictMode 개발 모드의 mount→cleanup→mount 시뮬레이션에서 root만 unmount하고
    // mapRef 등을 안 지우면, 재mount 시 위 가드에 걸려 죽은 root가 그대로 남는다.
    // 그러니 만든 것들을 여기서 한 번에 정리하고 ref도 같이 비워야 재생성이 된다.
    return () => {
      const root = overlayRootRef.current;
      overlayRootRef.current = null;
      overlayRef.current = null;
      mapRef.current = null;
      // 지금 상위 컴포넌트가 렌더링/커밋 중일 수 있어서 root.unmount()을
      // 이 자리에서 동기로 부르면 "unmount a root while React was already
      // rendering" 경고가 난다. 현재 렌더링 사이클이 끝난 뒤로 미룬다
      setTimeout(() => root?.unmount(), 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // center 변경 시 중심 이동
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter(
      new window.kakao.maps.LatLng(center.lat, center.lng),
    );
  }, [center.lat, center.lng]);

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
          color='#358C1C'
          fill='#358C1C'
          className='drop-shadow-md'
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

  // 검색 결과 등 마커 목록이 바뀌면 기존 마커를 지우고 다시 그림
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const { kakao } = window;

    markerInstancesRef.current.forEach((marker) => marker.setMap(null));
    markerInstancesRef.current = markers.map((marker) => {
      const markerInstance = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(marker.lat, marker.lng),
        map: mapRef.current!,
      });

      kakao.maps.event.addListener(markerInstance, 'click', () => {
        if (!overlayRef.current || !mapRef.current || !overlayRootRef.current)
          return;

        // render()가 비동기로 처리되면 setMap()이 아직 이전(빈) DOM 기준으로
        // 오버레이 크기/클릭 영역을 계산해버려서, 렌더을 동기로 강제한다
        flushSync(() => {
          overlayRootRef.current!.render(
            <MarkerOverlayContent
              onClose={() => overlayRef.current?.setMap(null)}
            >
              {renderMarkerContent ? (
                renderMarkerContent(marker)
              ) : (
                <DefaultMarkerContent marker={marker} />
              )}
            </MarkerOverlayContent>,
          );
        });

        overlayRef.current.setPosition(
          new kakao.maps.LatLng(marker.lat, marker.lng),
        );
        overlayRef.current.setMap(mapRef.current);
      });

      return markerInstance;
    });

    return () => {
      markerInstancesRef.current.forEach((marker) => marker.setMap(null));
      markerInstancesRef.current = [];
    };
  }, [loaded, markers, renderMarkerContent]);

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
