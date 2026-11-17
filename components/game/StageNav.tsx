"use client";

import { Check } from "lucide-react";
import type { Stage } from "@/lib/types";
import { useGameData } from "@/lib/data/context";
import { useGame } from "@/lib/engine/store";

export function StageNav() {
  const { state, dispatch } = useGame();
  const { stages } = useGameData();
  const current = stages.indexOf(state.stage);
  return (
    <nav className="stage-nav" aria-label="Challenge steps">
      {stages.map((stage, index) => {
        const available =
          index <= current ||
          (index === current + 1 &&
            (stage !== "Diagnose" || state.toolsUsed.length >= 3) &&
            (stage !== "Restore" || state.diagnosisLocked) &&
            (stage !== "Report" || Boolean(state.report)));
        return (
          <button
            key={stage}
            type="button"
            disabled={!available}
            aria-current={index === current ? "step" : undefined}
            className={`${index === current ? "stage-current" : ""} ${index < current ? "stage-done" : ""}`}
            onClick={() =>
              dispatch({ type: "SET_STAGE", stage: stage as Stage })
            }
          >
            <span>
              {index < current ? <Check aria-hidden="true" /> : `0${index + 1}`}
            </span>
            <small>{stage}</small>
          </button>
        );
      })}
    </nav>
  );
}
