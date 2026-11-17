"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, TriangleAlert, X } from "lucide-react";
import { actionCost, restorationActions, isActionZoneValid, projectConditions } from "@/lib/engine/actions";
import { buildSubmission, useGame } from "@/lib/engine/store";
import { submitSolution } from "@/lib/submit-solution";
import { useGameData } from "@/lib/data/context";
import { BottomSheet, ChunkyButton, ProgressBar } from "../ui-kit";

export function Restore() {
  const { state, dispatch } = useGame();
  const { scenario } = useGameData();
  const [overBudgetOpen, setOverBudgetOpen] = useState(false);
  const spent = state.plan.reduce((sum, piece) => sum + actionCost(piece), 0);
  const projected = projectConditions(state.plan, scenario.conditions);
  const submit = async () => {
    setOverBudgetOpen(false);
    const submission = buildSubmission(state);
    if (!submission) return;
    dispatch({ type: "START_VERIFICATION" });
    try {
      dispatch({ type: "RECEIVE_REPORT", report: await submitSolution(submission) });
    } catch {
      dispatch({ type: "FAIL_VERIFICATION" });
    }
  };
  const reorder = (from: number, to: number) =>
    dispatch({ type: "MOVE_ACTION", from, to });

  return (
    <>
      <section className="direct-step-panel direct-restore-panel">
        <div className="direct-panel-heading">
          <div>
            <span className="eyebrow">FIELDWORK · STEP 04</span>
            <h1>Place your restoration work.</h1>
          </div>
          <span className="field-budget-value">{Math.max(0, 100 - spent)} cr left</span>
        </div>
        <ProgressBar value={spent} max={100} label={`Restoration budget · ${spent}/100 credits`} overrun={spent > 100} />
        <p>Drag a component from the field tray onto its zone. Select a placed piece to adjust, rotate, duplicate, or reclaim it; use its arrow keys to move it.</p>
        <label className="projection-toggle">
          <input type="checkbox" checked={state.simulateProjection} onChange={(event) => dispatch({ type: "SET_SIMULATE", value: event.target.checked })} />
          Show projected field conditions
        </label>
        <details className="plan-summary" open>
          <summary>Plan sequence · {state.plan.length} pieces · {spent} credits</summary>
          {state.plan.length === 0 ? (
            <p>Your field plan is waiting for its first placed component.</p>
          ) : (
            <ol>
              {state.plan.map((piece, index) => {
                const action = restorationActions.find((item) => item.id === piece.actionId)!;
                const prerequisiteMissing = action.requires === "hydrology" && !state.plan.slice(0, index).some((item) => ["block-ditch", "restore-flow"].includes(item.actionId));
                const invalidZone = !isActionZoneValid(piece.actionId, piece.zone);
                return (
                  <li key={piece.id}>
                    <span className="plan-order-chip">{index + 1}</span>
                    <span className="plan-summary-copy"><strong>{action.name}</strong><small>{piece.zone} · {action.cost} credits · {action.durationDays} days</small></span>
                    {(prerequisiteMissing || invalidZone || action.warning) && <span className="plan-summary-warning" title={invalidZone ? "Wrong placement zone" : action.warning ?? "Place hydrology first"}><TriangleAlert aria-hidden="true" /> {invalidZone ? "Wrong zone" : prerequisiteMissing ? "Needs hydrology first" : "Review"}</span>}
                    <span className="plan-order-controls">
                      <button type="button" aria-label={`Move ${action.name} earlier`} disabled={index === 0} onClick={() => reorder(index, index - 1)}><ArrowUp aria-hidden="true" /></button>
                      <button type="button" aria-label={`Move ${action.name} later`} disabled={index === state.plan.length - 1} onClick={() => reorder(index, index + 1)}><ArrowDown aria-hidden="true" /></button>
                    </span>
                    <button type="button" className="plan-remove" aria-label={`Remove ${action.name} and refund ${action.cost} credits`} onClick={() => dispatch({ type: "REMOVE_ACTION", id: piece.id })}><X aria-hidden="true" /></button>
                  </li>
                );
              })}
            </ol>
          )}
        </details>
        {state.simulateProjection && <div className="projection-summary"><strong>Projection, not a result</strong><span>Water {projected.water} · Soil {projected.soil} · Vegetation {projected.vegetation} · Biodiversity {projected.biodiversity}</span></div>}
      </section>
      <div className="sticky-action direct-submit-action">
        <div><strong>{spent > 100 ? `Over budget by ${spent - 100} credits` : "Ready to verify your plan?"}</strong><small>{state.plan.length} placed components · {100 - spent} credits remaining</small></div>
        <ChunkyButton leafBurst disabled={!state.plan.length} onClick={() => spent > 100 ? setOverBudgetOpen(true) : void submit()}>Submit for verification</ChunkyButton>
      </div>
      <BottomSheet open={overBudgetOpen} onClose={() => setOverBudgetOpen(false)} title="Your plan is over budget">
        <p>Efficiency points will drop because you have exceeded the 100-credit budget. You can still submit or edit the field.</p>
        <div className="confirm-actions"><ChunkyButton variant="secondary" onClick={() => setOverBudgetOpen(false)}>Review field</ChunkyButton><ChunkyButton onClick={() => void submit()}>Submit anyway</ChunkyButton></div>
      </BottomSheet>
    </>
  );
}
