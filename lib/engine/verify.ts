import { actionCost, isActionZoneValid, restorationActions } from "./actions";
import { dailyScenario, investigationTools } from "./scenario";
import type {
  ComponentId,
  Conditions,
  PlacedPiece,
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
  const intersection = [...selected].filter((item) => expected.has(item)).length;
  const union = new Set([...selected, ...expected]).size;
  const componentPoints = union ? Math.round((4 * intersection) / union) : 0;
  const severityDistance = Math.abs(
    severities.indexOf(submission.severity) - severities.indexOf(truth.severity),
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
    (correct ? 12 : 0) + componentPoints + severityPoints + confidenceAdjustment,
    20,
  );
}

function applyEffects(
  conditions: Conditions,
  piece: PlacedPiece,
  effects: Partial<Conditions>,
) {
  for (const [key, baseDelta] of Object.entries(effects) as [
    keyof Conditions,
    number,
  ][]) {
    let delta = baseDelta;
    if (piece.actionId === "block-ditch" && piece.settings.openness !== undefined)
      delta = Math.round(baseDelta * (piece.settings.openness <= 20 ? 1 : 0.5));
    if (piece.actionId === "plant-sedges" && piece.settings.density !== undefined)
      delta = Math.round(
        baseDelta *
          ([3, 4].includes(piece.settings.density)
            ? 1
            : piece.settings.density === 5
              ? 0.6
              : 0.75),
      );
    if (piece.actionId === "restore-flow" && piece.settings.width !== undefined)
      delta = Math.round(baseDelta * (piece.settings.width / 2));
    conditions[key] = clamp(conditions[key] + delta, 100);
  }
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
  const plan = [...submission.plan].sort((a, b) => a.order - b.order);

  for (const piece of plan) {
    const action = restorationActions.find((item) => item.id === piece.actionId);
    if (!action) continue;
    if (!isActionZoneValid(piece.actionId, piece.zone)) {
      hasWastedAction = true;
      notes.push({
        kind: "warn",
        text: `${action.name} was placed outside a suitable zone and earned no restoration credit.`,
      });
      continue;
    }
    const prerequisiteMet = action.requires !== "hydrology" || hydrologySeen;
    if (!prerequisiteMet) {
      hasWastedAction = true;
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
      applyEffects(conditions, piece, action.effects);
      notes.push({
        kind: "fail",
        text: action.warning ?? `${action.name} may harm the wetland.`,
      });
      continue;
    }
    if (action.role === "risky" || action.role === "irrelevant") {
      hasWastedAction = true;
      applyEffects(conditions, piece, action.effects);
      notes.push({
        kind: "warn",
        text: action.warning ?? `${action.name} does not address the main problem.`,
      });
      continue;
    }

    validSpend += actionCost(piece);
    if (action.id === "block-ditch") {
      const openness = piece.settings.openness ?? 20;
      intervention += Math.max(0, 14 - Math.ceil(Math.max(0, openness - 20) / 10));
      if (openness > 20)
        notes.push({ kind: "warn", text: "A more open gate lets too much water escape." });
    }
    if (action.id === "restore-flow") {
      intervention += piece.settings.width === 1 ? 5 : piece.settings.width === 3 ? 7 : 6;
    }
    if (action.id === "plant-sedges") {
      const density = piece.settings.density ?? 3;
      intervention += [3, 4].includes(density) ? 6 : density === 5 ? 4 : 5;
      plantingAfterHydrology = hydrologySeen;
      if (density === 5)
        notes.push({ kind: "warn", text: "Over-dense planting may crowd native wetland growth." });
    }
    if (action.id === "monitor-water") {
      intervention += 4;
      monitoringAfterHydrology = hydrologySeen;
    }
    if (action.id === "bank-control") intervention += 2;
    recovery += action.recoveryPoints;
    applyEffects(conditions, piece, action.effects);
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
      : { kind: "fail", text: "The diagnosis missed the altered drainage pattern." },
  );
  const execution = clamp(
    (plantingAfterHydrology ? 8 : 0) +
      (monitoringAfterHydrology ? 4 : 0) +
      (plan.length >= 3 ? 4 : 0) +
      (!hasWastedAction && plan.length > 0 ? 4 : 0),
    20,
  );
  if (plantingAfterHydrology)
    notes.push({ kind: "pass", text: "Water flow was restored before planting." });
  const totalSpend = Math.max(
    submission.creditsSpent,
    plan.reduce(
      (sum, piece) =>
        sum + actionCost(piece),
      0,
    ),
  );
  const efficiency = plan.length
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
    ...(plan.some((piece) => piece.actionId === "block-ditch") && !hasHarmfulAction
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
