export {};

declare global {
  interface Window {
    kakao: typeof kakao;
  }

  namespace kakao.maps {
    function load(callback: () => void): void;

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
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
      getCenter(): LatLng;
      relayout(): void;
    }

    class Marker {
      constructor(options: { position: LatLng; map?: Map });
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
    }

    class CustomOverlay {
      constructor(options: {
        position: LatLng;
        content: string | HTMLElement;
        xAnchor?: number;
        yAnchor?: number;
        zIndex?: number;
        map?: Map;
        clickable?: boolean;
      });
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
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

  namespace kakao.maps.event {
    function addListener(
      target: object,
      type: string,
      handler: (...args: unknown[]) => void
    ): void;
    function removeListener(
      target: object,
      type: string,
      handler: (...args: unknown[]) => void
    ): void;
  }

  namespace kakao.maps.services {
    const Status: {
      OK: 'OK';
      ZERO_RESULT: 'ZERO_RESULT';
      ERROR: 'ERROR';
    };
    type StatusType = (typeof Status)[keyof typeof Status];

    interface PlacesSearchResultItem {
      id: string;
      place_name: string;
      category_name: string;
      category_group_code: string;
      category_group_name: string;
      phone: string;
      address_name: string;
      road_address_name: string;
      x: string;
      y: string;
      place_url: string;
    }

    interface PlacesSearchOptions {
      location?: kakao.maps.LatLng;
      radius?: number;
      page?: number;
      size?: number;
    }

    class Places {
      keywordSearch(
        keyword: string,
        callback: (
          data: PlacesSearchResultItem[],
          status: StatusType
        ) => void,
        options?: PlacesSearchOptions
      ): void;
    }
  }
}
