export type PositionCategory = 'GK' | 'DEF' | 'MID' | 'ATT';

export type PositionCode =
  | 'GK'
  | 'CB'
  | 'LCB'
  | 'RCB'
  | 'LB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'DM'
  | 'CDM'
  | 'LDM'
  | 'RDM'
  | 'CM'
  | 'LCM'
  | 'RCM'
  | 'AM'
  | 'CAM'
  | 'LAM'
  | 'RAM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'CF'
  | 'SS'
  | 'ST'
  | 'LS'
  | 'RS';

export interface PlayerStats {
  appearances?: number;
  goals?: number;
  assists?: number;
  cleanSheets?: number;
  yellowCards?: number;
  redCards?: number;
  minutesPlayed?: number;
  rating?: number;
}

export interface Player {
  id: string; // Canonical identifier (e.g. API-Football numeric ID "874")
  name: string; // Full official name
  shortName: string; // Display name
  position: PositionCode;
  category: PositionCategory;
  secondaryPositions: PositionCode[];
  club: string;
  clubId?: number;
  clubLogo?: string;
  league: string;
  nationality: string;
  nationalityFlag?: string;
  shirtNumber: number;
  rating: number;
  avatar: string; // Official verified photo URL
  preferredFoot?: 'Left' | 'Right' | 'Both';
  age?: number;
  height?: string;
  weight?: string;
  stats?: PlayerStats;
  isCustom?: boolean;
}

export type PlayerRoleName =
  | 'Goalkeeper'
  | 'Sweeper keeper'
  | 'Ball-playing defender'
  | 'Stopper'
  | 'Fullback'
  | 'Wingback'
  | 'Inverted fullback'
  | 'Defensive midfielder'
  | 'Deep-lying playmaker'
  | 'Ball-winning midfielder'
  | 'Box-to-box midfielder'
  | 'Mezzala'
  | 'Advanced playmaker'
  | 'Attacking midfielder'
  | 'Winger'
  | 'Inside forward'
  | 'Wide midfielder'
  | 'False 9'
  | 'Advanced forward'
  | 'Pressing forward'
  | 'Target forward'
  | 'Poacher';

export interface TacticalRoleDefinition {
  id: PlayerRoleName;
  name: PlayerRoleName;
  category: PositionCategory;
  description: string;
  keyInstructions: string[];
  suitedPositions: PositionCode[];
  iconName?: string;
}

export type FormationCategory =
  | 'Popular'
  | 'Modern'
  | 'Defensive'
  | 'Attacking'
  | 'Historical'
  | 'Experimental'
  | 'Custom';

export type MarkerStyle = 'avatar' | 'jersey' | 'badge' | 'minimal';

export interface PitchPlayer {
  instanceId: string;
  playerId: string; // Unique canonical player ID - Single Source of Truth
  player: Player;
  x: number; // 0 to 100 percentage of pitch width/height
  y: number; // 0 to 100 percentage of pitch width/height
  originX?: number; // original formation anchor X (0-100)
  originY?: number; // original formation anchor Y (0-100)
  shirtNumber: number;
  isCaptain: boolean;
  roleNote?: string;
  tacticalRole?: PlayerRoleName;
  displayStyle?: MarkerStyle;
}

export interface FormationSlot {
  position: PositionCode;
  label: string;
  x: number; // default vertical pitch x (0-100)
  y: number; // default vertical pitch y (0-100)
  defaultRole?: PlayerRoleName;
}

export interface Formation {
  id: string;
  name: string;
  category: FormationCategory;
  description: string;
  slots: FormationSlot[];
  defensiveShape?: string;
  attackingShape?: string;
  keyPrinciples?: string[];
}

export type TacticalPhase = 'In Possession' | 'Out of Possession' | 'Transition';
export type TacticalCategory = 'Attacking' | 'Defending' | 'Transitions' | 'Player Roles';

export interface TacticalConcept {
  id: string;
  name: string;
  category: TacticalCategory;
  phase: TacticalPhase;
  shortDescription: string;
  detailedMechanics: string;
  suitedPositions: PositionCode[];
  relatedFormations: string[];
  coachingCue: string;
}

export interface TacticalPreset {
  id: string;
  name: string;
  category: 'Modern' | 'Defensive' | 'Attacking' | 'Pressing' | 'Possession';
  formationId: string;
  description: string;
  tacticalInstructions: {
    attackingPhase: string;
    defensivePhase: string;
    transitionPhase: string;
    buildUpStyle: string;
    defensiveLine: 'Very High' | 'High' | 'Mid' | 'Low' | 'Deep';
    pressingIntensity: 'Aggressive' | 'Counter-Press' | 'Mid-Block' | 'Passive';
  };
  keyConcepts: string[];
  annotations?: Annotation[];
  slotAdjustments?: { [slotIndex: number]: { x: number; y: number; tacticalRole?: PlayerRoleName } };
}

export type AnnotationTool =
  | 'select'
  | 'pen'
  | 'arrow'
  | 'dashed-arrow'
  | 'press-arrow'
  | 'curved-arrow'
  | 'movement'
  | 'line'
  | 'circle'
  | 'rect'
  | 'highlight'
  | 'text'
  | 'eraser';

export interface AnnotationPoint {
  x: number; // 0-100 %
  y: number; // 0-100 %
}

export interface Annotation {
  id: string;
  tool: AnnotationTool;
  color: string;
  strokeWidth: number;
  points: AnnotationPoint[];
  radius?: number; // 0-100 %
  label?: string;
}

export type PitchTheme = 'emerald' | 'classic' | 'night' | 'tactical-board' | 'slate' | 'classic-grass';
export type PitchOrientation = 'vertical' | 'horizontal';

export interface LineupDisplaySettings {
  showNames: boolean;
  showNumbers: boolean;
  showRatings: boolean;
  showPositions: boolean;
  markerStyle: MarkerStyle;
  pitchTheme: PitchTheme;
  pitchOrientation: PitchOrientation;
  teamKitColor: string;
  teamTextColor: string;
  gkKitColor: string;
  gkTextColor: string;
  showGridLines: boolean;
  showGrid?: boolean;
  showPlayerTrails?: boolean;
  snapToFormation?: boolean;
}

export interface Lineup {
  id: string;
  title: string;
  teamName: string;
  opponentName?: string;
  notes?: string;
  formationId: string;
  players: PitchPlayer[]; // On-pitch (up to 11 or custom)
  bench: PitchPlayer[];   // Substitutes
  annotations: Annotation[];
  displaySettings: LineupDisplaySettings;
  createdAt: string;
  updatedAt: string;
}

export type ActiveTab = 'home' | 'tactics' | 'players' | 'lineups' | 'create';
