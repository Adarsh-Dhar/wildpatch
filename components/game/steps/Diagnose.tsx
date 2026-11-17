"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Droplets,
  Flower2,
  Footprints,
  Shovel,
  Waves,
} from "lucide-react";
import { useGameData } from "@/lib/data/context";
import { useGame } from "@/lib/engine/store";
import { Restorer } from "../art/Restorer";
import {
  ChunkyButton,
  ConfirmSeal,
  LeafBurst,
  SegmentedControl,
} from "../ui-kit";
import type { CauseId, ComponentId, Confidence, Severity } from "@/lib/types";

const components: { id: ComponentId; label: string; icon: typeof Waves }[] = [
  { id: "hydrology", label: "Hydrology", icon: Waves },
  { id: "soil", label: "Soil", icon: Shovel },
  { id: "vegetation", label: "Vegetation", icon: Flower2 },
  { id: "wildlife", label: "Wildlife", icon: Footprints },
  { id: "waterQuality", label: "Water quality", icon: Droplets },
];
const confidenceLabels: Confidence[] = ["low", "medium", "high"];
const severityOptions: Severity[] = ["mild", "moderate", "severe"];
export function Diagnose() {
  const { state, dispatch } = useGame();
  const { causes, investigationTools, toolEvidence } = useGameData();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expandedCause, setExpandedCause] = useState<CauseId | null>(null);
  const confidence = state.confidence ?? "low";
  const confidenceIndex = confidenceLabels.indexOf(confidence);
  const missing = [
    !state.cause && "a likely cause",
    !state.confidence && "your confidence",
    !state.components.length && "at least one affected component",
    !state.severity && "the severity",
  ].filter(Boolean);
  const evidenceForCause = (cause: CauseId) =>
    state.toolsUsed.map((toolId) => ({
      tool: investigationTools.find((tool) => tool.id === toolId)!,
      relation: toolEvidence[toolId]?.[cause] ?? ("neutral" as const),
    }));
  const lock = () => {
    dispatch({ type: "LOCK_DIAGNOSIS" });
    dispatch({ type: "CELEBRATE" });
    setConfirmOpen(false);
  };
  return (
    <>
      <div className="section-heading">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> FIELDWORK · STEP 03
        </div>
        <h1>
          What&apos;s really
          <br />
          going on <em>here?</em>
        </h1>
        <p>
          Weigh the evidence. A clear diagnosis helps the restoration plan work
          with nature, not against it.
        </p>
      </div>
      <div className="restorer-prompt">
        <Restorer mood="thinking" size={70} />
        <div>
          <small>YOUR FIELD NOTE</small>
          <p>
            “The rainfall looks normal... so what&apos;s keeping the water from
            staying?”
          </p>
        </div>
      </div>
      <fieldset className="diagnosis-fieldset" disabled={state.diagnosisLocked}>
        <legend>What do you think changed?</legend>
        <div className="choice-list">
          {causes.map((cause) => {
            const evidence = evidenceForCause(cause.id);
            const supports = evidence.filter(
              (item) => item.relation === "supports",
            ).length;
            const contradicts = evidence.filter(
              (item) => item.relation === "contradicts",
            ).length;
            const neutral = evidence.length - supports - contradicts;
            return (
              <article
                className={`cause-option-wrap ${state.cause === cause.id ? "cause-selected" : ""}`}
                key={cause.id}
              >
                <label className="cause-option">
                  <input
                    type="radio"
                    name="cause"
                    value={cause.id}
                    checked={state.cause === cause.id}
                    onChange={() =>
                      dispatch({ type: "SET_CAUSE", cause: cause.id })
                    }
                  />
                  <span className="cause-index">
                    0{causes.indexOf(cause) + 1}
                  </span>
                  <span className="cause-text">
                    <strong>{cause.title}</strong>
                    <small>{cause.description}</small>
                  </span>
                  <span className="radio-mark" />
                </label>
                <button
                  className="evidence-match"
                  aria-expanded={expandedCause === cause.id}
                  onClick={() =>
                    setExpandedCause(
                      expandedCause === cause.id ? null : cause.id,
                    )
                  }
                >
                  {state.toolsUsed.some(
                    (toolId) => toolEvidence[toolId]?.[cause.id],
                  ) ? (
                    <>
                      <span className="match-support">✓ {supports} for</span>
                      <span className="match-against">
                        ✕ {contradicts} against
                      </span>
                      <span>– {neutral} no data</span>
                    </>
                  ) : (
                    "No data yet"
                  )}
                </button>
                {expandedCause === cause.id && (
                  <div className="cause-evidence-list">
                    {evidence.map(({ tool, relation }) => (
                      <span key={tool.id} className={`cue-${relation}`}>
                        {relation === "supports"
                          ? "✓ Supports"
                          : relation === "contradicts"
                            ? "✕ Contradicts"
                            : "– Context"}{" "}
                        · {tool.name}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </fieldset>
      <section className="confidence-card">
        <div className="card-topline">
          <span>YOUR CONFIDENCE</span>
          <span className="confidence-value">{confidence.toUpperCase()}</span>
        </div>
        <label htmlFor="confidence-range">
          Higher confidence means a bigger bonus if right and a bigger penalty
          if wrong.
        </label>
        <input
          id="confidence-range"
          className="confidence-slider"
          type="range"
          min="0"
          max="2"
          step="1"
          value={confidenceIndex}
          disabled={state.diagnosisLocked}
          onChange={(event) =>
            dispatch({
              type: "SET_CONFIDENCE",
              confidence: confidenceLabels[Number(event.target.value)],
            })
          }
        />
        <div className="confidence-labels">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
        <p className="confidence-preview">
          Possible diagnosis swing:{" "}
          {confidence === "high"
            ? "+2 / −4"
            : confidence === "medium"
              ? "+1 / −2"
              : "±0"}{" "}
          points
        </p>
      </section>
      <fieldset className="component-fieldset" disabled={state.diagnosisLocked}>
        <legend>Affected ecosystem components</legend>
        <div className="component-chips">
          {components.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`component-chip ${state.components.includes(id) ? "component-selected" : ""}`}
              aria-pressed={state.components.includes(id)}
              onClick={() =>
                dispatch({ type: "TOGGLE_COMPONENT", component: id })
              }
            >
              <Icon aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="severity-section">
        <span className="eyebrow">SEVERITY</span>
        <SegmentedControl
          value={state.severity}
          options={severityOptions}
          ariaLabel="Choose severity"
          onChange={(value) =>
            dispatch({ type: "SET_SEVERITY", severity: value })
          }
        />
      </div>
      {state.diagnosisLocked && (
        <div className="locked-diagnosis">
          <LeafBurst seed={1} />
          <BadgeCheck aria-hidden="true" /> Diagnosis locked · your choices are
          read-only
        </div>
      )}
      {!state.diagnosisLocked && (
        <div className="sticky-action">
          <div>
            <strong>
              {missing.length
                ? "A little more thinking"
                : "Ready to make your call?"}
            </strong>
            <small>
              {missing.length
                ? `Still needed: ${missing.join(", ")}`
                : "Your diagnosis will be locked after confirmation."}
            </small>
          </div>
          <ChunkyButton
            disabled={missing.length > 0}
            onClick={() => setConfirmOpen(true)}
          >
            Lock diagnosis
          </ChunkyButton>
        </div>
      )}
      <ConfirmSeal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={lock}
        title="Lock your diagnosis?"
      >
        <p>
          You won&apos;t be able to change it later. Your reasoning will be
          evaluated after you submit a restoration plan.
        </p>
      </ConfirmSeal>
    </>
  );
}
