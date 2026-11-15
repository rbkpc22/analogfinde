import type { Candidate, Probe } from "./point";
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
  accent: string;
  analyzing: boolean;
  probe: Probe | null;
  candidates: Candidate[];
  onSelect: (site: Site) => void;
  onAnalyze: (lat: number, lng: number) => void;
  onOpenCandidate: (id: string) => void;
};
