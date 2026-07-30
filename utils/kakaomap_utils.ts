export const MAP_CENTER_STORAGE_KEY = 'nolmong:mapModalCenter';

// 부산역 (localStorage에 저장된 값이 없거나 손상됐을 때 쓰는 기본 위치)
const DEFAULT_CENTER = {
  lat: 35.1796,
  lng: 129.0756,
};

export const loadSavedMapCenter = (): { lat: number; lng: number } => {
  if (typeof window === 'undefined') return DEFAULT_CENTER;
  try {
    const raw = window.localStorage.getItem(MAP_CENTER_STORAGE_KEY);
    if (!raw) return DEFAULT_CENTER;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
      return { lat: parsed.lat, lng: parsed.lng };
    }
  } catch {
    // 저장된 값이 손상됐으면 그냥 무시하고 기본값을 쓴다
  }
  return DEFAULT_CENTER;
};

export const saveMapCenter = (center: { lat: number; lng: number }) => {
  window.localStorage.setItem(MAP_CENTER_STORAGE_KEY, JSON.stringify(center));
};
