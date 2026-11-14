import type { Site } from "./data";

export type MapSite = Site & {
  score: number;
  visible: boolean;
};

export type FlyTarget = {
  lat: number;
  lng: number;
  seq: number;
};

export type MapViewProps = {
  sites: MapSite[];
  selectedName: string | null;
  flyTarget: FlyTarget | null;
  onSelect: (site: Site) => void;
};
