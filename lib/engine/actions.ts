import type { ActionId, ComponentId, Conditions } from "@/lib/types";

export type RestorationAction = {
  id: ActionId;
  name: string;
  group:
    | "Hydrology"
    | "Planting"
    | "Water quality"
    | "Erosion"
    | "Invasives"
    | "Habitat";
  cost: number;
  labor: number;
  durationDays: number;
  role: "primary" | "supporting" | "minor" | "irrelevant" | "risky" | "harmful";
  requires?: "hydrology";
  effects: Partial<Conditions>;
  recoveryPoints: number;
  icon:
    | "gate"
    | "flow"
    | "sedge"
    | "sensor"
    | "bank"
    | "clippers"
    | "fish"
    | "fertilizer"
    | "turbine"
    | "grove";
  warning?: string;
};

export const restorationActions: RestorationAction[] = [
  {
    id: "block-ditch",
    name: "Block / modify drainage ditch",
    group: "Hydrology",
    cost: 35,
    labor: 3,
    durationDays: 4,
    role: "primary",
    effects: { water: 22, soil: 5 },
    recoveryPoints: 7,
    icon: "gate",
  },
  {
    id: "restore-flow",
    name: "Re-establish water-flow pathways",
    group: "Hydrology",
    cost: 25,
    labor: 2,
    durationDays: 2,
    role: "supporting",
    effects: { water: 10, biodiversity: 3 },
    recoveryPoints: 4,
    icon: "flow",
  },
  {
    id: "plant-sedges",
    name: "Plant native sedges",
    group: "Planting",
    cost: 15,
    labor: 2,
    durationDays: 3,
    role: "supporting",
    requires: "hydrology",
    effects: { vegetation: 12 },
    recoveryPoints: 3,
    icon: "sedge",
  },
  {
    id: "monitor-water",
    name: "Monitor water conditions",
    group: "Water quality",
    cost: 10,
    labor: 1,
    durationDays: 1,
    role: "supporting",
    requires: "hydrology",
    effects: {},
    recoveryPoints: 1,
    icon: "sensor",
  },
  {
    id: "bank-control",
    name: "Build bank erosion control",
    group: "Erosion",
    cost: 20,
    labor: 2,
    durationDays: 2,
    role: "minor",
    effects: { soil: 4 },
    recoveryPoints: 0,
    icon: "bank",
  },
  {
    id: "remove-invasives",
    name: "Remove invasive plants",
    group: "Invasives",
    cost: 20,
    labor: 2,
    durationDays: 2,
    role: "irrelevant",
    effects: {},
    recoveryPoints: 0,
    icon: "clippers",
  },
  {
    id: "fish-stocking",
    name: "Install fish stocking",
    group: "Habitat",
    cost: 20,
    labor: 2,
    durationDays: 3,
    role: "risky",
    effects: {},
    recoveryPoints: 0,
    icon: "fish",
    warning: "Adds animals without fixing habitat.",
  },
  {
    id: "fertilizer",
    name: "Apply fertilizer",
    group: "Planting",
    cost: 10,
    labor: 1,
    durationDays: 1,
    role: "harmful",
    effects: { waterQuality: -10, vegetation: -4 },
    recoveryPoints: 0,
    icon: "fertilizer",
    warning: "Can harm a nutrient-sensitive wetland.",
  },
  {
    id: "wind-pump",
    name: "Install wind-powered pump",
    group: "Hydrology",
    cost: 20,
    labor: 2,
    durationDays: 3,
    role: "harmful",
    effects: { water: -8 },
    recoveryPoints: 0,
    icon: "turbine",
    warning: "Lowers an already low water table.",
  },
  {
    id: "habitat-corridor",
    name: "Plant a habitat grove",
    group: "Habitat",
    cost: 25,
    labor: 2,
    durationDays: 4,
    role: "irrelevant",
    effects: { biodiversity: 2 },
    recoveryPoints: 0,
    icon: "grove",
  },
];

export const affectedComponents: Record<ActionId, ComponentId[]> = {
  "block-ditch": ["hydrology", "soil"],
  "restore-flow": ["hydrology", "wildlife"],
  "plant-sedges": ["vegetation"],
  "monitor-water": ["waterQuality"],
  "bank-control": ["soil"],
  "remove-invasives": ["vegetation"],
  "fish-stocking": ["wildlife"],
  fertilizer: ["vegetation", "waterQuality"],
  "wind-pump": ["hydrology"],
  "habitat-corridor": ["wildlife"],
};

export function projectConditions(
  plan: ActionId[],
  initial: Conditions,
): Conditions {
  const result = { ...initial };
  let hydrologySeen = false;
  for (const id of plan) {
    const action = restorationActions.find((item) => item.id === id);
    if (!action || (action.requires === "hydrology" && !hydrologySeen))
      continue;
    for (const [key, delta] of Object.entries(action.effects) as [
      keyof Conditions,
      number,
    ][])
      result[key] = Math.max(0, Math.min(100, result[key] + delta));
    if (
      action.group === "Hydrology" &&
      ["primary", "supporting"].includes(action.role)
    )
      hydrologySeen = true;
  }
  return result;
}
