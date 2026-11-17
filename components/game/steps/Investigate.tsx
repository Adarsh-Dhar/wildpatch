"use client";

import { useMemo, useState } from "react";
import { Bookmark, CircleHelp, Star } from "lucide-react";
import { useGameData } from "@/lib/data/context";
import { useGame } from "@/lib/engine/store";
import { investigationToolZones } from "@/lib/engine/scenario";
import { Restorer } from "../art/Restorer";
import { BottomSheet, ChunkyButton, EvidenceCard, ProgressBar } from "../ui-kit";
import type { CauseId, ToolId } from "@/lib/types";

const vagueReadout = "Not much to see here. Try another part of the fen.";
export function Investigate() {
  const { state, dispatch } = useGame();
  const { investigationTools, toolEvidence, causes } = useGameData();
  const [notebookOpen, setNotebookOpen] = useState(false);
  const affordableClues = state.toolsUsed.length;
  const pinnedCauses = useMemo(
    () =>
      causes.map((cause) => ({
        cause,
        clues: state.pinnedClues.flatMap((toolId) => {
          const valid = state.toolPlacements[toolId]?.valid ?? true;
          const relation = valid ? toolEvidence[toolId]?.[cause.id] : undefined;
          return relation
            ? [{ toolId, relation, title: investigationTools.find((tool) => tool.id === toolId)?.name ?? toolId }]
            : [];
        }),
      })),
    [causes, investigationTools, state.pinnedClues, state.toolPlacements, toolEvidence],
  );
  const hint = () => dispatch({ type: "USE_HINT" });
  const ready = state.toolsUsed.length >= 3;

  return (
    <>
      <section className="direct-step-panel investigate-panel">
        <div className="direct-panel-heading">
          <div>
            <span className="eyebrow">FIELDWORK · STEP 02</span>
            <h1>Take your tools into the fen.</h1>
          </div>
          <button className="notebook-button" onClick={() => setNotebookOpen(true)}>
            <Bookmark aria-hidden="true" /> Notebook <b>{state.pinnedClues.length}</b>
          </button>
        </div>
        <p>Drag a tool from the field belt onto the land, or select it and tap a zone. Readings appear as flags where you sampled.</p>
        <div className="investigation-budget-row">
          <ProgressBar value={state.investigationPoints} max={12} label={`Research points · ${state.investigationPoints}/12`} />
          {state.investigationPoints === 0 && <span>You&apos;ve used all your research points.</span>}
        </div>
        <div className="field-clue-strip" aria-label="Field observations">
          {state.toolsUsed.length === 0 ? (
            <p>Drop your first tool to place a reading flag on the field.</p>
          ) : (
            state.toolsUsed.map((id) => {
              const tool = investigationTools.find((item) => item.id === id)!;
              const valid = state.toolPlacements[id]?.valid ?? true;
              return (
                <EvidenceCard
                  key={id}
                  title={tool.name}
                  readout={valid ? tool.note : vagueReadout}
                  relation={valid ? "neutral" : "neutral"}
                  isNew={state.toolsUsed.at(-1) === id}
                  pinned={state.pinnedClues.includes(id)}
                  onPin={() => dispatch({ type: "PIN_CLUE", id })}
                />
              );
            })
          )}
        </div>
        <div className="investigation-footer-row">
          <div className="hint-card compact-hint">
            <Restorer mood="thinking" size={42} />
            <span><small>FIELD GUIDE · COSTS 2 PTS</small><strong>{state.hintUsed ? "Look at which clues rule things out, not just the ones that fit." : "What else could remove water from a marsh?"}</strong></span>
            <button type="button" aria-label="Use a field guide hint" disabled={state.hintUsed || state.investigationPoints < 2} onClick={hint}><CircleHelp aria-hidden="true" /></button>
          </div>
          <div className="fieldwork-count"><Star aria-hidden="true" /> {affordableClues} / 3 observations needed</div>
        </div>
      </section>
      <div className="sticky-action">
        <div><strong>{ready ? "Your field notes are ready." : "Keep investigating."}</strong><small>{ready ? "All evidence stays with you when you move on." : `${3 - state.toolsUsed.length} more readings needed to diagnose`}</small></div>
        <ChunkyButton disabled={!ready} onClick={() => dispatch({ type: "SET_STAGE", stage: "Diagnose" })}>Sort the evidence</ChunkyButton>
      </div>
      <BottomSheet open={notebookOpen} onClose={() => setNotebookOpen(false)} title={`Suspect list · ${state.pinnedClues.length} pinned clues`}>
        {state.pinnedClues.length === 0 ? <p>Pin a field flag to compare it against possible causes.</p> : <p>Your pinned evidence is sorted by the explanations it supports or contradicts.</p>}
        {pinnedCauses.map(({ cause, clues }) => (
          <section className="suspect-group" key={cause.id}>
            <h3>{cause.title}</h3>
            {clues.length ? clues.map((clue) => (
              <EvidenceCard
                key={`${cause.id}-${clue.toolId}`}
                title={clue.title}
                readout={investigationTools.find((tool) => tool.id === clue.toolId)?.note ?? ""}
                relation={clue.relation}
                pinned
                onPin={() => dispatch({ type: "PIN_CLUE", id: clue.toolId })}
              />
            )) : <small>No pinned evidence points here yet.</small>}
          </section>
        ))}
        <section className="suspect-group"><h3>Context</h3>{state.pinnedClues.filter((id) => !(state.toolPlacements[id]?.valid ?? true) || !causes.some((cause) => toolEvidence[id]?.[cause.id])).map((id) => <p key={id}>{investigationTools.find((tool) => tool.id === id)?.name}: {state.toolPlacements[id]?.valid === false ? vagueReadout : "context without a direct cause match."}</p>)}</section>
      </BottomSheet>
    </>
  );
}
