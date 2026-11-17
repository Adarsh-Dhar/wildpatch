import type { Submission } from "@/lib/types";
import { verify } from "./verify";

export const verificationCases: {
  label: string;
  submission: Submission;
  expected: string;
}[] = [
  {
    label: "A · careful restoration",
    submission: {
      cause: "drainage",
      confidence: "high",
      components: ["hydrology", "soil", "vegetation", "wildlife"],
      severity: "moderate",
      plan: [
        { id: "a-gate", actionId: "block-ditch", zone: "ditch", x: 27, y: 34, order: 1, settings: { openness: 10 } },
        { id: "a-flow", actionId: "restore-flow", zone: "stream", x: 68, y: 30, order: 2, settings: { width: 2 } },
        { id: "a-sedges", actionId: "plant-sedges", zone: "marsh", x: 50, y: 57, order: 3, settings: { density: 4 } },
        { id: "a-monitor", actionId: "monitor-water", zone: "marsh", x: 50, y: 57, order: 4, settings: {} },
      ],
      toolsUsed: ["water", "soil", "vegetation", "wildlife"],
      creditsSpent: 86,
    },
    expected: "approximately 100",
  },
  {
    label: "B · mostly sound plan",
    submission: {
      cause: "drainage",
      confidence: "medium",
      components: ["hydrology", "soil", "vegetation", "wildlife", "waterQuality"],
      severity: "moderate",
      plan: [
        { id: "b-gate", actionId: "block-ditch", zone: "ditch", x: 27, y: 34, order: 1, settings: { openness: 20 } },
        { id: "b-sedges", actionId: "plant-sedges", zone: "marsh", x: 50, y: 57, order: 2, settings: { density: 3 } },
        { id: "b-fish", actionId: "fish-stocking", zone: "stream", x: 68, y: 30, order: 3, settings: {} },
        { id: "b-monitor", actionId: "monitor-water", zone: "marsh", x: 50, y: 57, order: 4, settings: {} },
      ],
      toolsUsed: ["water", "soil", "vegetation"],
      creditsSpent: 81,
    },
    expected: "approximately 84",
  },
  {
    label: "C · harmful intervention",
    submission: {
      cause: "nutrient",
      confidence: "high",
      components: [],
      severity: "mild",
      plan: [
        { id: "c-fertilizer", actionId: "fertilizer", zone: "upland", x: 23, y: 75, order: 1, settings: {} },
        { id: "c-sedges", actionId: "plant-sedges", zone: "marsh", x: 50, y: 57, order: 2, settings: { density: 3 } },
        { id: "c-remove", actionId: "remove-invasives", zone: "marsh", x: 50, y: 57, order: 3, settings: {} },
      ],
      toolsUsed: ["water", "vegetation", "records"],
      creditsSpent: 45,
    },
    expected: "below 25",
  },
  {
    label: "D · action in the wrong zone",
    submission: {
      cause: "drainage",
      confidence: "high",
      components: ["hydrology", "soil", "vegetation", "wildlife"],
      severity: "moderate",
      plan: [
        { id: "d-gate", actionId: "block-ditch", zone: "stream", x: 68, y: 30, order: 1, settings: { openness: 10 } },
      ],
      toolsUsed: ["water", "soil", "vegetation"],
      creditsSpent: 35,
    },
    expected: "warn and no gate credit",
  },
  {
    label: "E · over-dense planting",
    submission: {
      cause: "drainage",
      confidence: "high",
      components: ["hydrology", "soil", "vegetation", "wildlife"],
      severity: "moderate",
      plan: [
        { id: "e-gate", actionId: "block-ditch", zone: "ditch", x: 27, y: 34, order: 1, settings: { openness: 20 } },
        { id: "e-sedges", actionId: "plant-sedges", zone: "marsh", x: 50, y: 57, order: 2, settings: { density: 5 } },
      ],
      toolsUsed: ["water", "soil", "vegetation"],
      creditsSpent: 50,
    },
    expected: "crowding warning",
  },
];

export const verificationResults = verificationCases.map(
  ({ label, submission, expected }) => {
    const report = verify(submission);
    const passes = label.startsWith("A")
      ? report.total >= 98
      : label.startsWith("B")
        ? Math.abs(report.total - 84) <= 2
        : label.startsWith("C")
          ? report.total < 25
          : label.startsWith("D")
            ? report.notes.some((note) => note.kind === "warn") && report.breakdown.intervention === 0
            : report.notes.some((note) => note.text.includes("Over-dense"));
    return { label, expected, score: report.total, passes, notes: report.notes };
  },
);
