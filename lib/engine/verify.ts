import { restorationActions } from "./actions";
import { dailyScenario, investigationTools } from "./scenario";
import type {
  ActionId,
  ComponentId,
  Conditions,
  Report,
  Severity,
  Submission,
} from "@/lib/types";

const clamp = (value: number, maximum: number) =>
  Math.max(0, Math.min(maximum, value));
const severities: Severity[] = ["mild", "moderate", "severe"];

function diagnosisScore(submission: Submission): number {
  const truth = dailyScenario.truth;
  const correct = submission.cause === truth.cause;
  const selected = new Set(submission.components);
  const expected = new Set<ComponentId>(truth.components);
  const intersection = [...selected].filter((item) =>
    expected.has(item),
  ).length;
  const union = new Set([...selected, ...expected]).size;
  const componentPoints = union ? Math.round((4 * intersection) / union) : 0;
  const severityDistance = Math.abs(
    severities.indexOf(submission.severity) -
      severities.indexOf(truth.severity),
  );
  const severityPoints =
    severityDistance === 0 ? 4 : severityDistance === 1 ? 2 : 0;
  const confidenceAdjustment = correct
    ? submission.confidence === "high"
      ? 2
      : submission.confidence === "medium"
        ? 1
        : 0
    : submission.confidence === "high"
      ? -4
      : submission.confidence === "medium"
        ? -2
        : 0;
  return clamp(
    (correct ? 12 : 0) +
      componentPoints +
      severityPoints +
      confidenceAdjustment,
    20,
  );
}

export function verify(submission: Submission): Report {
  const notes: Report["notes"] = [];
  const correctCause = submission.cause === dailyScenario.truth.cause;
  let intervention = 0;
  let hydrologySeen = false;
  let plantingAfterHydrology = false;
  let monitoringAfterHydrology = false;
  let hasWastedAction = false;
  let hasHarmfulAction = false;
  let validSpend = 0;
  let recovery = 0;
  const conditions: Conditions = { ...dailyScenario.conditions };

  for (const id of submission.plan) {
    const action = restorationActions.find((item) => item.id === id);
    if (!action) continue;
    const prerequisiteMet = action.requires !== "hydrology" || hydrologySeen;
    if (!prerequisiteMet) {
      notes.push({
        kind: "warn",
        text: `${action.name} is less effective before water flow is restored.`,
      });
      continue;
    }
    if (action.role === "harmful") {
      intervention -= 8;
      hasWastedAction = true;
      hasHarmfulAction = true;
      for (const [key, delta] of Object.entries(action.effects) as [
        keyof Conditions,
        number,
      ][])
        conditions[key] = clamp(conditions[key] + delta, 100);
      notes.push({
        kind: "fail",
        text: action.warning ?? `${action.name} may harm the wetland.`,
      });
      continue;
    }
    if (action.role === "risky" || action.role === "irrelevant") {
      hasWastedAction = true;
      for (const [key, delta] of Object.entries(action.effects) as [
        keyof Conditions,
        number,
      ][])
        conditions[key] = clamp(conditions[key] + delta, 100);
      notes.push({
        kind: "warn",
        text:
          action.warning ?? `${action.name} does not address the main problem.`,
      });
      continue;
    }
    validSpend += action.cost;
    if (action.id === "block-ditch") intervention += 14;
    if (action.id === "restore-flow") intervention += 6;
    if (action.id === "plant-sedges") {
      intervention += 6;
      plantingAfterHydrology = hydrologySeen;
    }
    if (action.id === "monitor-water") {
      intervention += 4;
      monitoringAfterHydrology = hydrologySeen;
    }
    if (action.id === "bank-control") intervention += 2;
    recovery += action.recoveryPoints;
    for (const [key, delta] of Object.entries(action.effects) as [
      keyof Conditions,
      number,
    ][])
      conditions[key] = clamp(conditions[key] + delta, 100);
    if (action.group === "Hydrology") hydrologySeen = true;
  }

  intervention = clamp(
    correctCause ? intervention : Math.round(intervention * 0.6),
    30,
  );
  const diagnosis = diagnosisScore(submission);
  notes.push(
    correctCause
      ? {
          kind: "pass",
          text: "The drainage channel is the strongest explanation for the evidence.",
        }
      : {
          kind: "fail",
          text: "The diagnosis missed the altered drainage pattern.",
        },
  );
  const execution = clamp(
    (plantingAfterHydrology ? 8 : 0) +
      (monitoringAfterHydrology ? 4 : 0) +
      (submission.plan.length >= 3 ? 4 : 0) +
      (!hasWastedAction && submission.plan.length > 0 ? 4 : 0),
    20,
  );
  if (plantingAfterHydrology)
    notes.push({
      kind: "pass",
      text: "Water flow was restored before planting.",
    });
  const totalSpend = Math.max(
    submission.creditsSpent,
    submission.plan.reduce(
      (sum, id) =>
        sum + (restorationActions.find((item) => item.id === id)?.cost ?? 0),
      0,
    ),
  );
  const efficiency = submission.plan.length
    ? clamp(
        Math.round((10 * validSpend) / Math.max(totalSpend, 1)) +
          (totalSpend <= 100 ? 5 : 0),
        15,
      )
    : 0;
  recovery = clamp(recovery, 15);
  const total = clamp(
    diagnosis + intervention + execution + efficiency + recovery,
    100,
  );
  const recoveryStage: Report["recoveryStage"] =
    total < 35
      ? "Degraded"
      : total < 55
        ? "Intervention completed"
        : total < 85
          ? "Early recovery"
          : "Ecological recovery";
  const researchSpent = submission.toolsUsed.reduce(
    (sum, id) =>
      sum + (investigationTools.find((tool) => tool.id === id)?.cost ?? 0),
    0,
  );
  const returnedWildlife = [
    ...(total >= 70 ? ["Heron"] : []),
    ...(conditions.water >= 55 ? ["Frog chorus"] : []),
    ...(total >= 85 ? ["Dragonfly"] : []),
  ];
  const unlockedAchievements = [
    ...(diagnosis === 20 ? ["Perfect diagnosis"] : []),
    ...(submission.plan.includes("block-ditch") && !hasHarmfulAction
      ? ["Hydrologist"]
      : []),
    ...(totalSpend <= 70 && total >= 80 ? ["Frugal field worker"] : []),
  ];
  return {
    total,
    breakdown: { diagnosis, intervention, execution, efficiency, recovery },
    notes,
    finalConditions: conditions,
    recoveryStage,
    verdictMood:
      total >= 80 ? "approving" : total >= 55 ? "thoughtful" : "stern",
    rewards: {
      xp: total * 3,
      restorationPoints: Math.round(total * 0.9),
      researchPoints:
        (submission.researchPointsRemaining ?? 12 - researchSpent) +
        (correctCause ? 4 : 0),
      communityPoints: Math.round(total / 4),
    },
    unlockedAchievements,
    returnedWildlife,
  };
}
export function verifySubmission(submission: Submission) {
  return verify(submission);
}
export const actionIsScoringValid = (id: ActionId) =>
  ["primary", "supporting", "minor"].includes(
    restorationActions.find((item) => item.id === id)?.role ?? "",
  );
