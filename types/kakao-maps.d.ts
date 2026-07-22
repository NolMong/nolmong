export {};

declare global {
  interface Window {
    kakao: typeof kakao;
  }

  namespace kakao.maps {
    function load(callback: () => void): void;

    class LatLng {
      constructor(lat: number, lng: number);
    }

    class Map {
      constructor(
        container: HTMLElement,
        options: { center: LatLng; level?: number }
      );
      setCenter(latlng: LatLng): void;
      setLevel(level: number): void;
    }

    class Marker {
      constructor(options: { position: LatLng; map?: Map });
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
    }
  }
}
