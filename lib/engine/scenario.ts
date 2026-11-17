import type { CauseId, Conditions, FieldZone, ToolId } from "@/lib/types";

export const initialConditions: Conditions = {
  water: 35,
  soil: 55,
  waterQuality: 70,
  vegetation: 48,
  biodiversity: 52,
};

export const dailyScenario = {
  id: "day-01-willow-fen",
  biome: "wetland" as const,
  difficulty: "intermediate" as const,
  credits: 100,
  investigationPoints: 12,
  conditions: initialConditions,
};

export const causes: { id: CauseId; title: string; description: string }[] = [
  {
    id: "drainage",
    title: "Drainage ditch altering the water regime",
    description: "A constructed channel may be draining the marsh.",
  },
  {
    id: "inflow",
    title: "Reduced upstream inflow",
    description: "Water may no longer reach the wetland.",
  },
  {
    id: "drought",
    title: "Short-term drought",
    description: "A dry spell could be stressing the habitat.",
  },
  {
    id: "nutrient",
    title: "Nutrient pollution",
    description: "Runoff may be changing the water chemistry.",
  },
  {
    id: "invasive",
    title: "Invasive species takeover",
    description: "Non-native plants may be outcompeting sedges.",
  },
];

export const investigationTools: {
  id: ToolId;
  name: string;
  cost: number;
  note: string;
  tag: string;
  visual: string;
}[] = [
  {
    id: "water",
    name: "Water analysis",
    cost: 3,
    note: "Water table −42cm vs norm; nitrate 1.1 mg/L (normal)",
    tag: "HYDROLOGY",
    visual: "water",
  },
  {
    id: "soil",
    name: "Soil analysis",
    cost: 3,
    note: "Soil moisture is 28% below baseline",
    tag: "SOIL",
    visual: "soil",
  },
  {
    id: "vegetation",
    name: "Vegetation survey",
    cost: 2,
    note: "Native sedge cover 41% (baseline 72%); invasive 4%",
    tag: "VEGETATION",
    visual: "vegetation",
  },
  {
    id: "wildlife",
    name: "Wildlife survey",
    cost: 2,
    note: "2 of 7 expected frog calls; heron ×1; otter absent",
    tag: "WILDLIFE",
    visual: "wildlife",
  },
  {
    id: "historical",
    name: "Historical maps",
    cost: 4,
    note: "A straight channel appears between survey maps",
    tag: "LAND USE",
    visual: "historical",
  },
  {
    id: "terrain",
    name: "Terrain survey",
    cost: 3,
    note: "Linear channel 1.2km long, 0.8m deep, drains southeast",
    tag: "TERRAIN",
    visual: "terrain",
  },
  {
    id: "habitat",
    name: "Habitat mapping",
    cost: 3,
    note: "Wetland edge has receded 18 metres",
    tag: "HABITAT",
    visual: "habitat",
  },
  {
    id: "records",
    name: "Rainfall records",
    cost: 2,
    note: "Rainfall within 6% of seasonal average; inflow normal",
    tag: "CLIMATE",
    visual: "records",
  },
  {
    id: "quick",
    name: "Quick observation",
    cost: 0,
    note: "Ground feels dry. Something straight cuts across the east side.",
    tag: "FIELD NOTE",
    visual: "quick",
  },
];

export const investigationToolZones: Record<ToolId, FieldZone[]> = {
  water: ["marsh", "ditch"],
  soil: ["marsh", "bank"],
  vegetation: ["marsh"],
  wildlife: ["marsh", "upland"],
  historical: ["ditch"],
  terrain: ["ditch", "stream"],
  habitat: ["bank"],
  records: ["stream"],
  quick: ["ditch", "stream", "marsh", "bank", "upland"],
};
