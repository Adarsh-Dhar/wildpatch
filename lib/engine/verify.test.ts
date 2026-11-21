import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn(async () => null) } },
}));
import { POST } from "@/app/api/verify/route";
import { verificationCases, verificationResults } from "./verify.test-cases";
import { dailyScenario, getDailyScenario, scenarioCatalog } from "./scenario";
import { getScenarioTruth, scenarioTruth } from "./scenario-private";
import { verify } from "./verify";

describe("restoration verifier", () => {
  it("selects one reproducible scenario for each UTC challenge date", () => {
    const firstDay = new Date("2026-01-01T00:00:00.000Z");
    const sameDay = new Date("2026-01-01T23:59:00.000Z");
    const nextDays = [0, 1, 2].map((offset) =>
      getDailyScenario(new Date(firstDay.getTime() + offset * 86_400_000)).id,
    );

    expect(getDailyScenario(firstDay).id).toBe(getDailyScenario(sameDay).id);
    expect(new Set(nextDays)).toHaveProperty("size", scenarioCatalog.length);
  });

  it.each(scenarioCatalog)("scores the private answer key for $id", (scenario) => {
    const truth = getScenarioTruth(scenario.id);
    const actionId =
      scenario.id === "reedmere-inflow-v1"
        ? "restore-flow"
        : scenario.id === "sedgewick-invasive-v1"
          ? "remove-invasives"
          : "block-ditch";
    const zone = actionId === "block-ditch" ? "ditch" : actionId === "restore-flow" ? "stream" : "marsh";
    const report = verify(
      {
        ...verificationCases[0].submission,
        cause: truth.cause,
        components: truth.components,
        severity: truth.severity,
        plan: [{ id: "scenario-test", actionId, zone, x: 50, y: 50, order: 1, settings: {} }],
      },
      scenario,
      truth,
    );

    expect(report.breakdown.diagnosis).toBe(20);
    expect(report.total).toBeGreaterThanOrEqual(50);
    expect(report.finalConditions).not.toEqual(scenario.conditions);
  });

  it("uses the supplied scenario conditions and private answer key", () => {
    const scenario = {
      ...dailyScenario,
      conditions: { ...dailyScenario.conditions, water: 10 },
    };
    const truth = { ...scenarioTruth, cause: "drought" as const };
    const report = verify(verificationCases[0].submission, scenario, truth);

    expect(report.breakdown.diagnosis).toBeLessThan(20);
    expect(report.finalConditions.water).toBe(42);
  });

  it.each(verificationResults)("passes scenario case $label", ({ passes }) => {
    expect(passes).toBe(true);
  });

  it("rejects a submission from an expired daily challenge", async () => {
    const response = await POST(
      new Request("http://localhost/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...verificationCases[0].submission,
          scenarioId: "willow-fen-drainage-v1:2000-01-01",
        }),
      }),
    );

    expect(response.status).toBe(409);
  });

  it("requires authentication before saving a valid submission", async () => {
    const response = await POST(
      new Request("http://localhost/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...verificationCases[0].submission,
          scenarioId: getDailyScenario().id,
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "Sign in to save your field report.",
    });
  });

  it("rejects a plan that exceeds the server-side credit budget", async () => {
    const submission = structuredClone(verificationCases[0].submission);
    submission.plan.push({
      id: "extra-gate",
      actionId: "block-ditch",
      zone: "ditch",
      x: 30,
      y: 30,
      order: submission.plan.length + 1,
      settings: { openness: 20 },
    });

    const response = await POST(
      new Request("http://localhost/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...submission, scenarioId: getDailyScenario().id }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "The plan exceeds the available field budget.",
    });
  });
});
