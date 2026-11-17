"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { Check } from "lucide-react";
import { useGameData } from "@/lib/data/context";
import { useGame } from "@/lib/engine/store";
import { investigationToolZones } from "@/lib/engine/scenario";
import { useDrag } from "@/lib/hooks/useDrag";
import { Restorer } from "../art/Restorer";
import { ChunkyButton, LeafBurst } from "../ui-kit";
import type { CauseId, Confidence, EvidenceRelation, ToolId } from "@/lib/types";

const confidenceLevels: Confidence[] = ["low", "medium", "high"];
export function Diagnose() {
  const { state, dispatch } = useGame();
  const { causes, investigationTools } = useGameData();
  const { registerDropZone, startDrag, isOver } = useDrag();
  const [pendingLink, setPendingLink] = useState<{ toolId: ToolId; cause: CauseId } | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<ToolId | null>(null);
  const confidenceIndex = Math.max(0, confidenceLevels.indexOf(state.confidence ?? "low"));
  const canLock = Boolean(state.cause && state.confidence && state.severity && state.components.length);
  const readoutIsValid = (toolId: ToolId) => state.toolPlacements[toolId]?.valid ?? true;
  const relationship = (toolId: ToolId, causeId: CauseId): EvidenceRelation => {
    if (!readoutIsValid(toolId)) return "neutral";
    return state.clueRelations[toolId]?.[causeId] ?? "neutral";
  };
  const setConfidence = (index: number) => dispatch({ type: "SET_CONFIDENCE", confidence: confidenceLevels[Math.max(0, Math.min(2, index))] });
  const nudgeConfidence = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); setConfidence(confidenceIndex + 1); }
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); setConfidence(confidenceIndex - 1); }
  };
  const dragConfidence = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.buttons) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setConfidence(Math.round(((event.clientX - rect.left) / rect.width) * 2));
  };
  const relationDrop = (payload: { kind: string; id: string }, causeId: string) => {
    if (payload.kind === "evidence") setPendingLink({ toolId: payload.id as ToolId, cause: causeId as CauseId });
    if (payload.kind === "prime") dispatch({ type: "SET_CAUSE", cause: causeId as CauseId });
  };
  const lock = () => {
    if (!canLock || state.diagnosisLocked) return;
    dispatch({ type: "LOCK_DIAGNOSIS" });
    dispatch({ type: "CELEBRATE" });
  };
  const reportDropRef = registerDropZone("diagnosis-report", ["seal"], () => lock());

  return (
    <>
      <section className="direct-step-panel diagnose-panel">
        <div className="direct-panel-heading">
          <div><span className="eyebrow">FIELDWORK · STEP 03</span><h1>Make sense of your field notes.</h1></div>
          {state.diagnosisLocked && <span className="locked-diagnosis"><Check aria-hidden="true" /> Locked</span>}
        </div>
        <p>Drag each flag onto a possible explanation and decide what the clue means. You can also tap a suspect card to set your prime suspect.</p>
        <div className="diagnose-board">
          <div className="evidence-tokens" aria-label="Evidence flags to sort">
            {state.toolsUsed.map((toolId) => {
              const tool = investigationTools.find((item) => item.id === toolId)!;
              const valid = readoutIsValid(toolId);
              return (
                <button key={toolId} type="button" className={`evidence-token ${valid ? "" : "evidence-vague"} ${selectedEvidence === toolId ? "evidence-token-selected" : ""}`} disabled={state.diagnosisLocked} aria-label={`Select or drag evidence: ${tool.name}`} onPointerDown={(event) => startDrag(event, { kind: "evidence", id: toolId, label: tool.name })} onClick={() => setSelectedEvidence((current) => current === toolId ? null : toolId)}>
                  <span>{tool.name}</span><small>{valid ? tool.note : "Not much to see here"}</small>
                </button>
              );
            })}
            {state.toolsUsed.length === 0 && <p>Return to Investigate to collect field readings.</p>}
          </div>
          <div className="prime-suspect-tray">
            <button type="button" className="prime-suspect-pin" disabled={state.diagnosisLocked} aria-label="Drag prime suspect pin onto a cause" onPointerDown={(event) => startDrag(event, { kind: "prime", id: "prime", label: "Prime suspect" })} onClick={() => { if (state.cause) dispatch({ type: "SET_CAUSE", cause: state.cause }); }}>Prime suspect</button>
            <span>Drag this pin onto one explanation</span>
          </div>
          <div className="suspect-drop-grid">
            {causes.map((cause) => {
              const related = state.toolsUsed.filter((toolId) => relationship(toolId, cause.id) !== "neutral");
              const supports = related.filter((toolId) => relationship(toolId, cause.id) === "supports").length;
              const contradicts = related.filter((toolId) => relationship(toolId, cause.id) === "contradicts").length;
              const dropRef = registerDropZone(`suspect-${cause.id}`, ["evidence", "prime"], relationDrop);
              return (
                <article key={cause.id} ref={dropRef} className={`suspect-drop-card ${isOver(`suspect-${cause.id}`) ? "suspect-drop-active" : ""} ${state.cause === cause.id ? "suspect-prime" : ""}`}>
                  <button type="button" disabled={state.diagnosisLocked} className="suspect-select" onClick={() => {
                    if (selectedEvidence) {
                      setPendingLink({ toolId: selectedEvidence, cause: cause.id });
                      setSelectedEvidence(null);
                    } else {
                      dispatch({ type: "SET_CAUSE", cause: cause.id });
                    }
                  }}>
                    <span className="suspect-cause-index">0{causes.indexOf(cause) + 1}</span>
                    <span><strong>{cause.title}</strong><small>{cause.description}</small></span>
                    {state.cause === cause.id && <b className="prime-pin-badge">PRIME</b>}
                  </button>
                  <div className="evidence-strings" aria-label={`Evidence links: ${supports} support, ${contradicts} contradict`}>
                    {related.length ? related.map((toolId) => {
                      const relation = relationship(toolId, cause.id);
                      const label = investigationTools.find((item) => item.id === toolId)?.name ?? toolId;
                      return <button type="button" key={toolId} disabled={state.diagnosisLocked} className={`evidence-string string-${relation}`} onClick={() => setPendingLink({ toolId, cause: cause.id })}>{relation === "supports" ? "✓" : "✕"} {label}</button>;
                    }) : <small>{state.toolsUsed.some((toolId) => !readoutIsValid(toolId)) ? "No relevant reading yet" : "Drop a flag to connect evidence"}</small>}
                    <span className="evidence-tally">{supports} for · {contradicts} against</span>
                  </div>
                </article>
              );
            })}
          </div>
          {pendingLink && (
            <div className="relation-popover" role="dialog" aria-label="Choose evidence relation">
              <strong>{investigationTools.find((item) => item.id === pendingLink.toolId)?.name} · {causes.find((cause) => cause.id === pendingLink.cause)?.title}</strong>
              <div>
                {(["supports", "contradicts", "neutral"] as const).map((relation) => <button type="button" key={relation} onClick={() => { dispatch({ type: "SET_CLUE_RELATION", toolId: pendingLink.toolId, cause: pendingLink.cause, relation }); setPendingLink(null); }}>{relation === "supports" ? "✓ Supports" : relation === "contradicts" ? "✕ Contradicts" : "– Not sure"}</button>)}
              </div>
            </div>
          )}
        </div>
        <div className="diagnosis-dials">
          <section className="dial-card">
            <span className="eyebrow">CONFIDENCE</span>
            <button className="rotary-dial" type="button" role="slider" aria-label="Confidence dial" aria-valuemin={0} aria-valuemax={2} aria-valuenow={confidenceIndex} aria-valuetext={state.confidence ?? "Choose confidence"} disabled={state.diagnosisLocked} onKeyDown={nudgeConfidence} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragConfidence(event); }} onPointerMove={dragConfidence}>
              <span className="dial-pointer" style={{ transform: `rotate(${(confidenceIndex - 1) * 45}deg)` }} />
              <strong>{state.confidence?.toUpperCase() ?? "SET"}</strong>
            </button>
            <small>Turn with pointer or arrow keys</small>
            <span>{state.confidence === "high" ? "+2 / −4" : state.confidence === "medium" ? "+1 / −2" : "±0"} possible score swing</span>
          </section>
          <section className="dial-card severity-gauge">
            <label htmlFor="severity-range" className="eyebrow">SEVERITY · {state.severity ?? "NOT SET"}</label>
            <div className="gauge-face"><span className={`gauge-needle gauge-${state.severity ?? "unset"}`} /></div>
            <input id="severity-range" type="range" min="0" max="2" step="1" value={state.severity === "mild" ? 0 : state.severity === "severe" ? 2 : 1} disabled={state.diagnosisLocked} aria-label="Severity gauge" onChange={(event) => dispatch({ type: "SET_SEVERITY", severity: (["mild", "moderate", "severe"] as const)[Number(event.target.value)] })} />
            <div className="gauge-labels"><span>Mild</span><span>Moderate</span><span>Severe</span></div>
          </section>
        </div>
        <div className="report-sheet" ref={reportDropRef}>
          <div><span className="eyebrow">FIELD REPORT</span><strong>{state.cause ? causes.find((cause) => cause.id === state.cause)?.title : "Waiting for your prime suspect"}</strong><small>{state.components.length} affected components · {state.confidence ?? "confidence unset"} confidence · {state.severity ?? "severity unset"}</small></div>
          <button type="button" className="wax-seal-token" disabled={!canLock || state.diagnosisLocked} aria-label="Drag wax seal onto report to lock diagnosis" onPointerDown={(event) => startDrag(event, { kind: "seal", id: "seal", label: "Seal diagnosis" })} onClick={lock}>{state.diagnosisLocked ? "LOCKED" : "SEAL"}</button>
          {isOver("diagnosis-report") && <span className="seal-drop-hint">Drop to lock diagnosis</span>}
        </div>
        <p className="diagnosis-help">Drag the seal onto the report when your prime suspect, confidence, severity, and field components are set. Diagnosis remains hidden from the verifier until your report.</p>
      </section>
    </>
  );
}
