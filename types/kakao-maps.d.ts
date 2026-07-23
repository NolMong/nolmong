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

    class LatLngBounds {
      constructor();
      extend(latlng: LatLng): void;
    }

    class Map {
      constructor(
        container: HTMLElement,
        options: { center: LatLng; level?: number },
      );
      setCenter(latlng: LatLng): void;
      setLevel(level: number): void;
      setBounds(bounds: LatLngBounds): void;
    }

    class Marker {
      constructor(options: { position: LatLng; map?: Map });
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
    }

    class CustomOverlay {
      constructor(options: {
        position: LatLng;
        content: HTMLElement | string;
        map?: Map;
        xAnchor?: number;
        yAnchor?: number;
        zIndex?: number;
      });
      setMap(map: Map | null): void;
    }

    class Polyline {
      constructor(options: {
        path: LatLng[];
        strokeWeight?: number;
        strokeColor?: string;
        strokeOpacity?: number;
        strokeStyle?: string;
      });
      setMap(map: Map | null): void;
    }
  }
}
