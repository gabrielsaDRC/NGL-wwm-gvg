export type PlayerClass =
  | 'Healer'
  | 'Tank'
  | 'DPS Strategic'
  | 'DPS Silkbind'
  | 'DPS Bamboo'
  | 'DPS Nameless'
  | 'DPS Misto';

export interface Player {
  id: string;
  name: string;
  class: PlayerClass;
  teamId: number | null;
  notes?: string;
  isLeader?: boolean;
}

export interface Team {
  id: number;
  name: string;
  color: string;
}

export type MapElementType = 'marker' | 'text' | 'arrow' | 'area' | 'teamToken' | 'playerToken';

export interface BaseMapElement {
  id: string;
  type: MapElementType;
  x: number;
  y: number;
  linkedTeamId?: number;
  linkedPlayerId?: string;
}

export interface MarkerElement extends BaseMapElement {
  type: 'marker';
  icon: string;
  label: string;
  color: string;
  size: number;
}

export interface TextElement extends BaseMapElement {
  type: 'text';
  content: string;
  color: string;
  fontSize: number;
  backgroundColor?: string;
}

export interface ArrowElement extends BaseMapElement {
  type: 'arrow';
  x2: number;
  y2: number;
  color: string;
  width: number;
  label?: string;
}

export interface AreaElement extends BaseMapElement {
  type: 'area';
  width: number;
  height: number;
  color: string;
  opacity: number;
  shape: 'rectangle' | 'circle';
}

export interface TeamTokenElement extends BaseMapElement {
  type: 'teamToken';
  teamId: number;
  size: number;
}

export interface PlayerTokenElement extends BaseMapElement {
  type: 'playerToken';
  playerId: string;
  size: number;
}

export type MapElement =
  | MarkerElement
  | TextElement
  | ArrowElement
  | AreaElement
  | TeamTokenElement
  | PlayerTokenElement;

export interface MapViewport {
  zoom: number;
  panX: number;
  panY: number;
}

export interface MapBackground {
  name: string;
  url: string;
  width: number;
  height: number;
}

export interface MapData {
  backgroundImage: MapBackground | null;
  viewport: MapViewport;
  elements: MapElement[];
}

export interface AppState {
  version: string;
  lastUpdated: string;
  teams: Team[];
  players: Player[];
  strategyNotes: string;
  map: MapData;
}

export type ToolMode = 'select' | 'marker' | 'text' | 'arrow' | 'area' | 'teamToken' | 'playerToken';
