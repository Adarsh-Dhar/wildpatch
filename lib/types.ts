export type Tab = "Today" | "Map" | "Reserve" | "Profile";
export type Stage =
  | "Briefing"
  | "Investigate"
  | "Diagnose"
  | "Restore"
  | "Report";
export type Biome = "wetland" | "forest" | "grassland" | "mountain";
export type ParcelStatus =
  | "healthy"
  | "degraded"
  | "under-restoration"
  | "recovering"
  | "protected";
export type CauseId =
  | "drainage"
  | "inflow"
  | "drought"
  | "nutrient"
  | "invasive";
export type Confidence = "low" | "medium" | "high";
export type Severity = "mild" | "moderate" | "severe";
export type ComponentId =
  | "hydrology"
  | "soil"
  | "vegetation"
  | "wildlife"
  | "waterQuality";
export type ToolId =
  | "water"
  | "soil"
  | "vegetation"
  | "wildlife"
  | "historical"
  | "terrain"
  | "habitat"
  | "records"
  | "quick";
export type ActionId =
  | "block-ditch"
  | "restore-flow"
  | "plant-sedges"
  | "monitor-water"
  | "bank-control"
  | "remove-invasives"
  | "fish-stocking"
  | "fertilizer"
  | "wind-pump"
  | "habitat-corridor";

export type Conditions = {
  water: number;
  soil: number;
  waterQuality: number;
  vegetation: number;
  biodiversity: number;
};
export type FieldZone = "ditch" | "stream" | "marsh" | "bank" | "upland";
export type PlacedPiece = {
  id: string;
  actionId: ActionId;
  zone: FieldZone;
  x: number;
  y: number;
  order: number;
  rotation?: number;
  settings: {
    openness?: number;
    density?: number;
    width?: number;
  };
};
export type EvidenceRelation = "supports" | "contradicts" | "neutral";
export type EvidenceNote = { kind: "pass" | "warn" | "fail"; text: string };
export type Breakdown = {
  diagnosis: number;
  intervention: number;
  execution: number;
  efficiency: number;
  recovery: number;
};
export type Submission = {
  cause: CauseId;
  confidence: Confidence;
  components: ComponentId[];
  severity: Severity;
  plan: PlacedPiece[];
  toolsUsed: ToolId[];
  creditsSpent: number;
  researchPointsRemaining?: number;
};
export type Report = {
  total: number;
  breakdown: Breakdown;
  notes: EvidenceNote[];
  finalConditions: Conditions;
  recoveryStage:
    | "Degraded"
    | "Intervention completed"
    | "Early recovery"
    | "Ecological recovery";
  verdictMood: "approving" | "thoughtful" | "stern";
  rewards: {
    xp: number;
    restorationPoints: number;
    researchPoints: number;
    communityPoints: number;
  };
  unlockedAchievements: string[];
  returnedWildlife: string[];
};
export type Parcel = {
  id: string;
  name: string;
  biome: Biome;
  status: ParcelStatus;
  conditions: Conditions;
  severity: Severity;
  history: { day: number; title: string; note: string }[];
  today?: boolean;
};
export type GameSettings = {
  soundOn: boolean;
  reducedMotion: boolean;
  colorblindMode: boolean;
  placementGrid: boolean;
  textSize: "normal" | "large";
};
