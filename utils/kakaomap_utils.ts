export const MAP_CENTER_STORAGE_KEY = 'nolmong:mapModalCenter';

export const loadSavedMapCenter = ():
  | { lat: number; lng: number }
  | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.sessionStorage.getItem(MAP_CENTER_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
      return { lat: parsed.lat, lng: parsed.lng };
    }
  } catch {
    // 저장된 값이 손상됐으면 그냥 무시하고 기본값을 쓴다
    return {
      lat: 35.1796, // 부산역
      lng: 129.0756,
    };
  }
  return undefined;
};

export const saveMapCenter = (center: { lat: number; lng: number }) => {
  window.sessionStorage.setItem(MAP_CENTER_STORAGE_KEY, JSON.stringify(center));
};
