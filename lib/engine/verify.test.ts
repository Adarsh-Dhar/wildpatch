import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/verify/route";
import { verificationCases, verificationResults } from "./verify.test-cases";

describe("restoration verifier", () => {
  it.each(verificationResults)("passes scenario case $label", ({ passes }) => {
    expect(passes).toBe(true);
  });

  it("returns a report for a valid server-verified submission", async () => {
    const response = await POST(
      new Request("http://localhost/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(verificationCases[0].submission),
      }),
    );

    expect(response.status).toBe(200);
    const report = await response.json();
    expect(report.total).toBeGreaterThanOrEqual(0);
    expect(report.total).toBeLessThanOrEqual(100);
    expect(report.breakdown).toHaveProperty("diagnosis");
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
        body: JSON.stringify(submission),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "The plan exceeds the available field budget.",
    });
  });
});
