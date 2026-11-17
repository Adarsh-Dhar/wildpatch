"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Droplets,
  Fish,
  Flower2,
  Leaf,
  Microscope,
  Scissors,
  Shovel,
  TriangleAlert,
  Waves,
  Wind,
  X,
} from "lucide-react";
import {
  projectConditions,
  restorationActions,
  type RestorationAction,
} from "@/lib/engine/actions";
import { buildSubmission, useGame } from "@/lib/engine/store";
import { submitSolution } from "@/lib/api";
import { useGameData } from "@/lib/data/context";
import { useSettings } from "@/lib/ui/settings-context";
import { WildpatchField } from "@/components/field/WildpatchField";
import {
  BottomSheet,
  ChunkyButton,
  LeafBurst,
  ProgressBar,
  SegmentedControl,
} from "../ui-kit";

const groups = [
  "All",
  "Hydrology",
  "Planting",
  "Invasives",
  "Erosion",
  "Water quality",
  "Habitat",
] as const;
const actionIcon = {
  gate: Waves,
  flow: Droplets,
  sedge: Flower2,
  sensor: Microscope,
  bank: Shovel,
  clippers: Scissors,
  fish: Fish,
  fertilizer: Leaf,
  turbine: Wind,
  grove: Leaf,
};
export function Restore() {
  const { state, dispatch } = useGame();
  const { settings } = useSettings();
  const { scenario } = useGameData();
  const initialConditions = scenario.conditions;
  const [group, setGroup] = useState<(typeof groups)[number]>("All");
  const [simulate, setSimulate] = useState(false);
  const [overBudgetOpen, setOverBudgetOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const spent = state.plan.reduce(
    (sum, id) =>
      sum + (restorationActions.find((item) => item.id === id)?.cost ?? 0),
    0,
  );
  const filteredActions = useMemo(
    () =>
      restorationActions.filter(
        (action) => group === "All" || action.group === group,
      ),
    [group],
  );
  const projected = projectConditions(state.plan, initialConditions);
  const addAction = (action: RestorationAction) => {
    if (state.plan.includes(action.id)) return;
    dispatch({ type: "ADD_ACTION", id: action.id });
    dispatch({ type: "CELEBRATE" });
  };
  const submit = async () => {
    setOverBudgetOpen(false);
    const submission = buildSubmission(state);
    if (!submission) return;
    dispatch({ type: "START_VERIFICATION" });
    try {
      const report = await submitSolution(submission);
      dispatch({ type: "RECEIVE_REPORT", report });
    } catch {
      dispatch({ type: "FAIL_VERIFICATION" });
    }
  };
  const reorder = (from: number, to: number) => {
    if (from !== to) dispatch({ type: "MOVE_ACTION", from, to });
    setDragIndex(null);
    setDropIndex(null);
  };
  return (
    <>
      <div className="section-heading">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> FIELDWORK · STEP 04
        </div>
        <h1>
          Make room for <em>recovery.</em>
        </h1>
        <p>
          Build an ordered restoration plan. Helpful work can exceed the budget,
          but efficiency will suffer.
        </p>
      </div>
      <ProgressBar
        value={spent}
        max={100}
        label={`Credits spent · ${100 - spent} remaining`}
        overrun={spent > 100}
      />
      <div className="restore-field-heading">
        <div>
          <span className="eyebrow">WILLOW FEN · RESTORATION FIELD</span>
          <strong>Move the pieces to a field zone</strong>
        </div>
        <label className="simulate-toggle">
          <input
            type="checkbox"
            checked={simulate}
            onChange={(event) => setSimulate(event.target.checked)}
          />{" "}
          Simulate preview
        </label>
      </div>
      <WildpatchField simulate={simulate} />
      <section className="plan-timeline">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">RESTORATION SEQUENCE</span>
            <h2>Your plan</h2>
          </div>
          <span className="tool-count">
            {state.plan.length} ACTIONS · {spent} CR
          </span>
        </div>
        {!state.plan.length ? (
          <div className="empty-plan">
            <span>+</span>
            <span>Your plan is waiting for its first action</span>
          </div>
        ) : (
          <ol className="plan-slots">
            {state.plan.map((id, index) => {
              const action = restorationActions.find((item) => item.id === id)!;
              const Icon = actionIcon[action.icon];
              const unmet =
                action.requires === "hydrology" &&
                !state.plan
                  .slice(0, index)
                  .some(
                    (planId) =>
                      restorationActions.find((item) => item.id === planId)
                        ?.group === "Hydrology",
                  );
              return (
                <li
                  key={id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDropIndex(index);
                  }}
                  onDrop={() => dragIndex !== null && reorder(dragIndex, index)}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setDropIndex(null);
                  }}
                  className={`${unmet ? "plan-warning-slot" : ""} ${dropIndex === index ? "plan-drop-target" : ""}`}
                >
                  <span className="plan-slot-number">{index + 1}</span>
                  <Icon aria-hidden="true" />
                  <span className="plan-slot-copy">
                    <strong>{action.name}</strong>
                    <small>
                      {action.cost} credits · {action.labor} labor ·{" "}
                      {action.durationDays} days
                    </small>
                  </span>
                  {unmet && (
                    <span className="plan-warning-chip">
                      <TriangleAlert aria-hidden="true" /> Water conditions may
                      not support this yet.
                    </span>
                  )}
                  {action.warning && (
                    <span className="risk-chip">
                      <TriangleAlert aria-hidden="true" /> May not help here
                    </span>
                  )}
                  <span className="plan-order-controls">
                    <button
                      disabled={index === 0}
                      aria-label={`Move ${action.name} earlier`}
                      onClick={() => reorder(index, index - 1)}
                    >
                      <ArrowUp aria-hidden="true" />
                    </button>
                    <button
                      disabled={index === state.plan.length - 1}
                      aria-label={`Move ${action.name} later`}
                      onClick={() => reorder(index, index + 1)}
                    >
                      <ArrowDown aria-hidden="true" />
                    </button>
                  </span>
                  <strong className="plan-slot-cost">{action.cost} cr</strong>
                  <button
                    className="plan-remove"
                    aria-label={`Remove ${action.name}; refund ${action.cost} credits`}
                    onClick={() => dispatch({ type: "REMOVE_ACTION", id })}
                  >
                    <X aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>
      <section className="toolkit-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">FIELD TOOLKIT</span>
            <h2>Choose an action</h2>
          </div>
          <span className="tool-count">{state.plan.length} ADDED</span>
        </div>
        <SegmentedControl
          value={group}
          options={groups}
          ariaLabel="Filter restoration actions"
          onChange={setGroup}
        />
        <div className="action-grid">
          {filteredActions.map((action) => {
            const Icon = actionIcon[action.icon];
            const added = state.plan.includes(action.id);
            return (
              <button
                type="button"
                key={action.id}
                className={`action-card ${added ? "action-added" : ""}`}
                aria-pressed={added}
                disabled={added}
                onClick={() => addAction(action)}
              >
                <span className="action-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span className="action-copy">
                  <strong>{action.name}</strong>
                  <small>
                    {action.group} · {action.labor} labor ·{" "}
                    {action.durationDays} days
                  </small>
                </span>
                <span className="action-cost">
                  {action.cost}
                  <small>cr</small>
                </span>
                {action.warning && (
                  <span className="action-risk" title={action.warning}>
                    <TriangleAlert aria-label={action.warning} />
                  </span>
                )}
                {added && (
                  <span className="action-check">
                    <Leaf aria-hidden="true" />
                    <LeafBurst seed={state.plan.indexOf(action.id)} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
      {state.plan.length > 0 && (
        <div className="projection-summary">
          <strong>Projection, not a result</strong>
          <span>
            Water {projected.water} · Soil {projected.soil} · Vegetation{" "}
            {projected.vegetation} · Biodiversity {projected.biodiversity}
          </span>
        </div>
      )}
      <div className="sticky-action">
        <div>
          <strong>Ready to verify your plan?</strong>
          <small>
            {spent > 100
              ? `Over budget by ${spent - 100} credits`
              : `${100 - spent} credits remaining`}
          </small>
        </div>
        <ChunkyButton
          leafBurst
          disabled={!state.plan.length}
          onClick={() => (spent > 100 ? setOverBudgetOpen(true) : submit())}
        >
          Submit for verification
        </ChunkyButton>
      </div>
      <BottomSheet
        open={overBudgetOpen}
        onClose={() => setOverBudgetOpen(false)}
        title="Your plan is over budget"
      >
        <p>
          Efficiency points will drop by {spent - 100} credits. You can still
          submit this plan, or return to make adjustments.
        </p>
        <div className="confirm-actions">
          <ChunkyButton
            variant="secondary"
            onClick={() => setOverBudgetOpen(false)}
          >
            Review plan
          </ChunkyButton>
          <ChunkyButton onClick={submit}>Submit anyway</ChunkyButton>
        </div>
      </BottomSheet>
      <span className="sr-only" aria-live="polite">
        {settings.placementGrid
          ? "Placement grid is visible."
          : "Placement grid is hidden."}
      </span>
    </>
  );
}
