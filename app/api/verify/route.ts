import { NextResponse } from "next/server";
import { actionCost, restorationActions } from "@/lib/engine/actions";
import { dailyScenario, investigationTools } from "@/lib/engine/scenario";
import { verify } from "@/lib/engine/verify";
import type {
  ActionId,
  CauseId,
  ComponentId,
  Confidence,
  FieldZone,
  PlacedPiece,
  Severity,
  Submission,
  ToolId,
} from "@/lib/types";

const causes = new Set<CauseId>(["drainage", "inflow", "drought", "nutrient", "invasive"]);
const components = new Set<ComponentId>(["hydrology", "soil", "vegetation", "wildlife", "waterQuality"]);
const confidences = new Set<Confidence>(["low", "medium", "high"]);
const severities = new Set<Severity>(["mild", "moderate", "severe"]);
const zones = new Set<FieldZone>(["ditch", "stream", "marsh", "bank", "upland"]);
const actionIds = new Set<ActionId>(restorationActions.map((action) => action.id));
const toolIds = new Set<ToolId>(investigationTools.map((tool) => tool.id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumberBetween(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function isPiece(value: unknown): value is PlacedPiece {
  if (!isRecord(value) || !isRecord(value.settings)) return false;
  const { settings } = value;
  const settingsAreValid =
    (settings.openness === undefined || (Number.isInteger(settings.openness) && isNumberBetween(settings.openness, 0, 100))) &&
    (settings.density === undefined || (Number.isInteger(settings.density) && isNumberBetween(settings.density, 1, 5))) &&
    (settings.width === undefined || (Number.isInteger(settings.width) && isNumberBetween(settings.width, 1, 3)));

  return (
    typeof value.id === "string" && value.id.length > 0 && value.id.length <= 100 &&
    actionIds.has(value.actionId as ActionId) &&
    zones.has(value.zone as FieldZone) &&
    isNumberBetween(value.x, 0, 100) &&
    isNumberBetween(value.y, 0, 100) &&
    Number.isInteger(value.order) && isNumberBetween(value.order, 1, 20) &&
    (value.rotation === undefined || isNumberBetween(value.rotation, 0, 359)) &&
    settingsAreValid
  );
}

function parseSubmission(value: unknown): Submission | null {
  if (!isRecord(value) || !Array.isArray(value.components) || !Array.isArray(value.plan) || !Array.isArray(value.toolsUsed)) return null;
  if (!causes.has(value.cause as CauseId) || !confidences.has(value.confidence as Confidence) || !severities.has(value.severity as Severity)) return null;
  if (value.components.length === 0 || value.components.length > components.size || !value.components.every((item) => components.has(item as ComponentId))) return null;
  if (new Set(value.components).size !== value.components.length) return null;
  if (value.plan.length === 0 || value.plan.length > 20 || !value.plan.every(isPiece)) return null;
  if (value.toolsUsed.length < 3 || value.toolsUsed.length > toolIds.size || !value.toolsUsed.every((item) => toolIds.has(item as ToolId))) return null;
  if (new Set(value.toolsUsed).size !== value.toolsUsed.length) return null;

  const plan = value.plan as PlacedPiece[];
  const ids = new Set(plan.map((piece) => piece.id));
  const orders = new Set(plan.map((piece) => piece.order));
  if (ids.size !== plan.length || orders.size !== plan.length) return null;

  return {
    cause: value.cause as CauseId,
    confidence: value.confidence as Confidence,
    components: value.components as ComponentId[],
    severity: value.severity as Severity,
    plan,
    toolsUsed: value.toolsUsed as ToolId[],
    creditsSpent: 0,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }

  const submission = parseSubmission(body);
  if (!submission) {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }

  const researchSpent = submission.toolsUsed.reduce(
    (total, id) => total + (investigationTools.find((tool) => tool.id === id)?.cost ?? 0),
    0,
  );
  const creditsSpent = submission.plan.reduce(
    (total, piece) => total + actionCost(piece),
    0,
  );
  if (
    researchSpent > dailyScenario.investigationPoints ||
    creditsSpent > dailyScenario.credits
  ) {
    return NextResponse.json({ error: "The plan exceeds the available field budget." }, { status: 400 });
  }

  const serverSubmission: Submission = {
    ...submission,
    creditsSpent,
    researchPointsRemaining: Math.max(0, dailyScenario.investigationPoints - researchSpent),
  };

  return NextResponse.json(verify(serverSubmission));
}
