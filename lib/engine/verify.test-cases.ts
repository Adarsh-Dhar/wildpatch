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
      plan: ["block-ditch", "restore-flow", "plant-sedges", "monitor-water"],
      toolsUsed: ["water", "soil", "vegetation", "wildlife"],
      creditsSpent: 85,
    },
    expected: "approximately 100",
  },
  {
    label: "B · mostly sound plan",
    submission: {
      cause: "drainage",
      confidence: "medium",
      components: [
        "hydrology",
        "soil",
        "vegetation",
        "wildlife",
        "waterQuality",
      ],
      severity: "moderate",
      plan: ["block-ditch", "plant-sedges", "fish-stocking", "monitor-water"],
      toolsUsed: ["water", "soil", "vegetation"],
      creditsSpent: 80,
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
      plan: ["fertilizer", "plant-sedges", "remove-invasives"],
      toolsUsed: ["water", "vegetation", "records"],
      creditsSpent: 45,
    },
    expected: "below 25",
  },
];

export const verificationResults = verificationCases.map(
  ({ label, submission, expected }) => {
    const report = verify(submission);
    return {
      label,
      expected,
      score: report.total,
      passes: label.startsWith("A")
        ? report.total >= 98
        : label.startsWith("B")
          ? Math.abs(report.total - 84) <= 2
          : report.total < 25,
    };
  },
);
