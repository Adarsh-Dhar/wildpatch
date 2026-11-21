import type {
  ActionId,
  ComponentId,
  Conditions,
  FieldZone,
  PlacedPiece,
} from "@/lib/types";

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

const validZones: Partial<Record<ActionId, FieldZone[]>> = {
  "block-ditch": ["ditch"],
  "restore-flow": ["stream", "ditch"],
  "plant-sedges": ["marsh", "bank"],
  "monitor-water": ["ditch", "stream", "marsh", "bank"],
};

export function actionCost(piece: PlacedPiece) {
  const baseCost = restorationActions.find((item) => item.id === piece.actionId)?.cost ?? 0;
  if (piece.actionId === "block-ditch")
    return baseCost + Math.ceil(Math.max(0, (piece.settings.openness ?? 20) - 20) / 20);
  if (piece.actionId === "plant-sedges")
    return baseCost + (piece.settings.density ?? 3) - 3;
  if (piece.actionId === "restore-flow")
    return baseCost + ((piece.settings.width ?? 2) - 2) * 5;
  return baseCost;
}

export function isActionZoneValid(actionId: ActionId, zone: FieldZone) {
  return validZones[actionId]?.includes(zone) ?? true;
}

export function projectConditions(
  plan: PlacedPiece[],
  initial: Conditions,
): Conditions {
  const result = { ...initial };
  let hydrologySeen = false;
  for (const piece of [...plan].sort((a, b) => a.order - b.order)) {
    const action = restorationActions.find(
      (item) => item.id === piece.actionId,
    );
    if (
      !action ||
      !isActionZoneValid(piece.actionId, piece.zone) ||
      (action.requires === "hydrology" && !hydrologySeen)
    )
      continue;
    for (const [key, delta] of Object.entries(action.effects) as [
      keyof Conditions,
      number,
    ][]) {
      let adjusted = delta;
      if (piece.actionId === "block-ditch" && piece.settings.openness !== undefined)
        adjusted = Math.round(delta * (piece.settings.openness <= 20 ? 1 : 0.5));
      if (piece.actionId === "plant-sedges" && piece.settings.density !== undefined)
        adjusted = Math.round(delta * (piece.settings.density === 3 || piece.settings.density === 4 ? 1 : 0.6));
      if (piece.actionId === "restore-flow" && piece.settings.width !== undefined)
        adjusted = Math.round(delta * (piece.settings.width / 2));
      result[key] = Math.max(0, Math.min(100, result[key] + adjusted));
    }
    if (
      action.group === "Hydrology" &&
      ["primary", "supporting"].includes(action.role)
    )
      hydrologySeen = true;
  }
  return result;
}
