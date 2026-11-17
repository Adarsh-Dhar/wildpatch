"use client";

import { Check } from "lucide-react";
import { BottomSheet } from "./ui-kit";

const rubric = [
  [
    "Diagnosis",
    20,
    "Match the cause and identify the affected parts of the ecosystem.",
  ],
  [
    "Intervention",
    30,
    "Choose actions that address the cause, in a thoughtful order.",
  ],
  ["Execution", 20, "Restore water flow before planting and monitoring."],
  ["Efficiency", 15, "Use your field budget on valid, useful work."],
  ["Recovery", 15, "Project the ecosystem changes your plan can support."],
] as const;
export function ScoringSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="How scoring works">
      <p className="scoring-intro">
        The verifier checks the reasoning behind your plan.
      </p>
      <div className="rubric-list">
        {rubric.map(([label, points, description]) => (
          <div className="rubric-row" key={label}>
            <span>
              <Check aria-hidden="true" />
              <strong>{label}</strong>
            </span>
            <b>{points} pts</b>
            <small>{description}</small>
          </div>
        ))}
      </div>
      <p className="scoring-disclaimer">
        Scores measure scientific reasoning and planning in a simplified game,
        not real restoration outcomes.
      </p>
    </BottomSheet>
  );
}
