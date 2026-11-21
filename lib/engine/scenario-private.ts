import type { ActionId, CauseId, ComponentId, Conditions, Severity } from "@/lib/types";

export type ScenarioTruth = {
  cause: CauseId;
  components: ComponentId[];
  severity: Severity;
  diagnosisMessage: string;
  actionRules?: Partial<
    Record<
      ActionId,
      {
        role: "primary" | "supporting" | "minor" | "irrelevant" | "risky" | "harmful";
        interventionPoints: number;
        recoveryPoints: number;
        effects?: Partial<Conditions>;
      }
    >
  >;
};

export const scenarioTruth: ScenarioTruth = {
  cause: "drainage",
  components: ["hydrology", "soil", "vegetation", "wildlife"],
  severity: "moderate",
  diagnosisMessage: "The drainage channel is the strongest explanation for the evidence.",
};

const scenarioTruthById: Record<string, ScenarioTruth> = {
  "willow-fen-drainage-v1": scenarioTruth,
  "reedmere-inflow-v1": {
    cause: "inflow",
    components: ["hydrology", "vegetation", "wildlife"],
    severity: "moderate",
    diagnosisMessage: "Reduced upstream inflow best explains the stream and habitat evidence.",
    actionRules: {
      "restore-flow": {
        role: "primary",
        interventionPoints: 14,
        recoveryPoints: 7,
        effects: { water: 22, biodiversity: 6 },
      },
      "block-ditch": {
        role: "irrelevant",
        interventionPoints: 0,
        recoveryPoints: 0,
        effects: { water: -3 },
      },
    },
  },
  "sedgewick-invasive-v1": {
    cause: "invasive",
    components: ["vegetation", "wildlife"],
    severity: "severe",
    diagnosisMessage: "The invasive plant takeover best explains the loss of native cover and wildlife.",
    actionRules: {
      "remove-invasives": {
        role: "primary",
        interventionPoints: 14,
        recoveryPoints: 8,
        effects: { vegetation: 20, biodiversity: 5 },
      },
      "block-ditch": {
        role: "irrelevant",
        interventionPoints: 0,
        recoveryPoints: 0,
        effects: { water: -3 },
      },
      "restore-flow": {
        role: "irrelevant",
        interventionPoints: 0,
        recoveryPoints: 0,
        effects: {},
      },
    },
  },
};

export function getScenarioTruth(scenarioId: string): ScenarioTruth {
  const contentId = scenarioId.split(":", 1)[0];
  const truth = scenarioTruthById[contentId];
  if (!truth) throw new Error(`No private answer key for scenario ${scenarioId}`);
  return truth;
}
