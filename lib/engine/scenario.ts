import type { Biome, CauseId, Conditions, FieldZone, ToolId } from "@/lib/types";

export type Scenario = {
  id: string;
  challengeDate?: string;
  biome: Biome;
  difficulty: "beginner" | "intermediate" | "advanced";
  credits: number;
  investigationPoints: number;
  conditions: Conditions;
  siteName: string;
  headline: string;
  story: string;
  summary: string;
  hint: string;
  postHint: string;
  fieldNotes: { title: string; detail: string }[];
  evidence: Partial<Record<ToolId, string>>;
};

export const initialConditions: Conditions = {
  water: 35,
  soil: 55,
  waterQuality: 70,
  vegetation: 48,
  biodiversity: 52,
};

export const scenarioCatalog: Scenario[] = [
  {
    id: "willow-fen-drainage-v1",
    biome: "wetland",
    difficulty: "intermediate",
    credits: 100,
    investigationPoints: 12,
    conditions: initialConditions,
    siteName: "Willow Fen",
    headline: "Willow Fen is in trouble.",
    story: "I\u2019ve stirred up a little trouble at Willow Fen. Think you can figure out why?",
    summary: "Something has unsettled this quiet wetland. Follow the clues, find the cause, and help the fen find its way back.",
    hint: "Rainfall is normal. What else could remove water from a marsh?",
    postHint: "Look at which clues rule things out, not just the ones that fit.",
    fieldNotes: [
      { title: "Falling water levels", detail: "The fen sits 42cm below its seasonal norm" },
      { title: "Declining native sedges", detail: "Marsh plants have declined by nearly a third" },
      { title: "Fewer frogs and herons", detail: "The wetland chorus has grown quiet" },
    ],
    evidence: {},
  },
  {
    id: "reedmere-inflow-v1",
    biome: "wetland",
    difficulty: "beginner",
    credits: 100,
    investigationPoints: 12,
    conditions: { water: 42, soil: 58, waterQuality: 72, vegetation: 55, biodiversity: 48 },
    siteName: "Reedmere Marsh",
    headline: "Reedmere has gone quiet.",
    story: "Reedmere’s feeder stream has changed. Follow the evidence before the marsh dries further.",
    summary: "A shrinking stream and stressed marsh edge point to a change upstream. Find the source and restore a healthy flow.",
    hint: "Rainfall is near normal. What could reduce a stream’s flow before it reaches the marsh?",
    postHint: "Compare the feeder-stream readings with rainfall and water-quality records.",
    fieldNotes: [
      { title: "Weak feeder stream", detail: "Flow is 38% below its seasonal baseline" },
      { title: "Drying marsh edge", detail: "Soft-soil habitat has retreated along the eastern bank" },
      { title: "Fewer amphibians", detail: "Spring call counts are down across three survey sites" },
    ],
    evidence: {
      water: "Stream flow is 38% below baseline; water quality remains within range",
      soil: "Moisture declines gradually toward the upstream boundary",
      vegetation: "Native reed cover is reduced near the feeder channel",
      wildlife: "Amphibian calls are scarce near the low-flow inlet",
      historical: "Older maps show a former feeder channel entering from the north",
      terrain: "The feeder stream is intact but carries substantially less water",
      habitat: "Marsh edge contraction is greatest near the northern inlet",
      records: "Rainfall is near seasonal average; upstream flow records show a decline",
      quick: "The streambed is intact, but little water is reaching the marsh.",
    },
  },
  {
    id: "sedgewick-invasive-v1",
    biome: "wetland",
    difficulty: "advanced",
    credits: 100,
    investigationPoints: 12,
    conditions: { water: 62, soil: 51, waterQuality: 68, vegetation: 35, biodiversity: 40 },
    siteName: "Sedgewick Pool",
    headline: "A takeover is underway.",
    story: "Sedgewick Pool still holds water, but its native plants are losing ground. Find out what is displacing them.",
    summary: "The water regime is stable, yet native vegetation and wildlife are declining. Trace the ecological pressure before choosing an intervention.",
    hint: "If water and soil are stable, what could be crowding out native plants?",
    postHint: "Look for a recent change in plant surveys and where wildlife observations have fallen.",
    fieldNotes: [
      { title: "Native cover collapsing", detail: "Native sedges occupy 29% of plots, down from 68%" },
      { title: "Dense unfamiliar growth", detail: "A fast-spreading plant now dominates the western shallows" },
      { title: "Fewer nesting sites", detail: "Wetland bird observations have fallen across the pool" },
    ],
    evidence: {
      water: "Water depth and chemistry are close to seasonal baselines",
      soil: "Soil moisture is stable; nutrient levels are within the normal range",
      vegetation: "Non-native cover has tripled in two seasons while native sedges receded",
      wildlife: "Bird and amphibian observations are lowest in dense non-native patches",
      historical: "A new plant first appears in survey records two years ago",
      terrain: "No new channels or barriers are visible around the pool",
      habitat: "Open-water and native-edge habitat are being crowded out",
      records: "Rainfall and inflow are near seasonal averages",
      quick: "The pool has water. The unfamiliar plants are spreading fast.",
    },
  },
];

function utcDay(date: Date) {
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
}

export function getDailyScenario(date = new Date()): Scenario {
  const index = ((utcDay(date) % scenarioCatalog.length) + scenarioCatalog.length) % scenarioCatalog.length;
  const challengeDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  const scenario = scenarioCatalog[index];
  return {
    ...scenario,
    id: `${scenario.id}:${challengeDate}`,
    challengeDate,
  };
}

export const dailyScenario = scenarioCatalog[0];

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
