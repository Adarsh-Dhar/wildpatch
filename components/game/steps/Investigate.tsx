"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, CircleHelp, Search, Star, X } from "lucide-react";
import { useGameData } from "@/lib/data/context";
import { useGame } from "@/lib/engine/store";
import { Restorer } from "../art/Restorer";
import {
  EvidenceCard,
  BottomSheet,
  ChunkyButton,
  LeafBurst,
  ProgressBar,
  PaperSkeleton,
} from "../ui-kit";
import { InvestigationVisual } from "./InvestigationVisual";
import type { CauseId, ToolId } from "@/lib/types";

const zones = [
  { id: "inflow", label: "Inflow stream", tools: ["records", "water"] },
  {
    id: "marsh",
    label: "Central marsh",
    tools: ["vegetation", "wildlife", "soil"],
  },
  { id: "ditch", label: "Drainage ditch", tools: ["terrain", "historical"] },
  { id: "bank", label: "Eastern bank", tools: ["habitat", "soil"] },
] as const;
export function Investigate() {
  const { state, dispatch } = useGame();
  const { investigationTools, toolEvidence, causes } = useGameData();
  const [scanning, setScanning] = useState<ToolId | null>(null);
  const [newEvidence, setNewEvidence] = useState<ToolId | null>(null);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanHint, setScanHint] = useState("");
  const [spentFlash, setSpentFlash] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 400);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!newEvidence) return;
    const id = window.setTimeout(() => setNewEvidence(null), 3000);
    return () => window.clearTimeout(id);
  }, [newEvidence]);
  const recommendations = useMemo(
    () =>
      new Set<ToolId>(
        zones.find((zone) => zone.id === state.selectedZone)?.tools ?? [],
      ),
    [state.selectedZone],
  );
  const toggleTool = (id: ToolId) => {
    if (scanning) return;
    if (state.toolsUsed.includes(id)) {
      dispatch({ type: "REMOVE_TOOL", id });
      setNewEvidence((current) => (current === id ? null : current));
      return;
    }
    const tool = investigationTools.find((item) => item.id === id);
    if (!tool) return;
    if (state.investigationPoints < tool.cost) {
      dispatch({ type: "SET_TOAST", message: "Not enough research points" });
      return;
    }
    setScanning(id);
    setScanHint(
      ["terrain", "habitat", "historical"].includes(id)
        ? "Mapping the land…"
        : "Taking a closer look…",
    );
    window.setTimeout(() => {
      dispatch({ type: "USE_TOOL", id });
      dispatch({ type: "CELEBRATE" });
      if (tool.cost > 0) {
        setSpentFlash(`−${tool.cost}`);
        window.setTimeout(() => setSpentFlash(""), 850);
      }
      setScanning(null);
      setScanHint("");
      setNewEvidence(id);
    }, 900);
  };
  const pinnedCauses = (cause: CauseId) =>
    state.pinnedClues.flatMap((id) => {
      const relation = toolEvidence[id]?.[cause];
      return relation
        ? [
            {
              id,
              relation,
              title:
                investigationTools.find((tool) => tool.id === id)?.name ?? id,
            },
          ]
        : [];
    });
  if (loading) return <PaperSkeleton rows={5} />;
  return (
    <>
      <div className="section-heading">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> FIELDWORK · STEP 02
        </div>
        <h1>
          Follow the <em>evidence.</em>
        </h1>
        <p>
          Take a closer look around the fen. Every observation brings the bigger
          picture into focus.
        </p>
      </div>
      <div className="research-budget">
        <ProgressBar
          value={state.investigationPoints}
          max={12}
          label={`Research points ${state.investigationPoints}/12`}
        />
        {spentFlash && <span className="points-float">{spentFlash}</span>}
      </div>
      <div className={`site-map ${scanning ? "site-scanning" : ""}`}>
        <div className="map-head">
          <span>WILLOW FEN · FIELD MAP</span>
          <span>04° 12′ N / 82° 06′ W</span>
        </div>
        <div className="map-drawing">
          <div className="map-water map-river" />
          <div className="map-island island-one" />
          <div className="map-island island-two" />
          <div className="map-channel" />
          {zones.map((zone, index) => (
            <button
              key={zone.id}
              type="button"
              className={`map-pin pin-${String.fromCharCode(97 + index)} ${state.selectedZone === zone.id ? "pin-selected" : ""}`}
              aria-pressed={state.selectedZone === zone.id}
              onClick={() =>
                dispatch({
                  type: "SET_ZONE",
                  zone: state.selectedZone === zone.id ? null : zone.id,
                })
              }
            >
              <span>{index + 1}</span>
              <small>{zone.label}</small>
            </button>
          ))}
          <span className="north-arrow">N ↑</span>
          <div className="map-scale" />
          {scanning && (
            <div className="scan-sweep" aria-live="polite">
              {scanHint}
            </div>
          )}
        </div>
        <div className="map-legend">
          <span>Tap a site to focus your fieldwork</span>
          {state.selectedZone && (
            <button
              className="clear-focus-button"
              aria-label="Clear selected site focus"
              onClick={() => dispatch({ type: "SET_ZONE", zone: null })}
            >
              Clear focus <X aria-hidden="true" />
            </button>
          )}
          <button
            className="notebook-button"
            onClick={() => setNotebookOpen(true)}
          >
            <Bookmark aria-hidden="true" /> Notebook{" "}
            <b>{state.pinnedClues.length}</b>
          </button>
        </div>
      </div>
      <div className="section-title-row">
        <div>
          <span className="eyebrow">CHOOSE YOUR TOOLS</span>
          <h2>What will you investigate?</h2>
        </div>
        <span className="tool-count">
          {state.toolsUsed.length} / {investigationTools.length}
        </span>
      </div>
      {state.toolsUsed.length === investigationTools.length && (
        <p className="all-tools-note">
          All field tools checked. You&apos;ve done everything you can with
          today&apos;s research points.
        </p>
      )}
      {state.investigationPoints === 0 && (
        <p className="empty-research">
          You&apos;ve used all your research points. Time to diagnose.
        </p>
      )}
      <div className="tool-grid">
        {investigationTools.map((tool) => {
          const used = state.toolsUsed.includes(tool.id);
          const isScanning = scanning === tool.id;
          const recommended = recommendations.has(tool.id);
          return (
            <button
              key={tool.id}
              type="button"
              className={`tool-card ${used ? "tool-picked" : ""} ${isScanning ? "tool-scanning" : ""} ${state.investigationPoints < tool.cost ? "tool-unaffordable" : ""}`}
              disabled={Boolean(scanning)}
              onClick={() => toggleTool(tool.id)}
              aria-pressed={used}
              aria-label={
                used
                  ? `Remove ${tool.name} and refund ${tool.cost} research points`
                  : `Use ${tool.name} for ${tool.cost} research points`
              }
            >
              <span className="tool-icon">
                <Search aria-hidden="true" />
              </span>
              {recommended && !used && (
                <span className="recommended-badge">
                  <Star aria-hidden="true" /> Recommended here
                </span>
              )}
              {used && (
                <span className="tool-check" aria-label="Used">
                  ✓
                </span>
              )}
              <span className="tool-cost">
                {tool.cost === 0 ? "FREE" : `${tool.cost} PTS`}
              </span>
              <strong>{tool.name}</strong>
              <small>
                {tool.tag} · {tool.note}
              </small>
              {used && (
                <small className="tool-remove-hint">
                  Used · select to remove{tool.cost > 0 ? " and refund points" : ""}
                </small>
              )}
              {isScanning && <span className="scan-label">{scanHint}</span>}
            </button>
          );
        })}
      </div>
      <div className="section-title-row evidence-heading">
        <div>
          <span className="eyebrow">YOUR NOTEBOOK</span>
          <h2>Evidence board</h2>
        </div>
        <span className="tool-count">{state.toolsUsed.length} CLUES</span>
      </div>
      {!state.toolsUsed.length ? (
        <div className="empty-notebook">
          <span>★</span>
          <p>Your board is waiting for its first clue.</p>
          <small>Use a tool, then pin a clue to build your suspect list.</small>
        </div>
      ) : (
        <div className="evidence-board">
          <div className="evidence-list">
            {state.toolsUsed.map((id) => {
              const item = investigationTools.find((tool) => tool.id === id)!;
              return (
                <div className="evidence-note" key={id}>
                  <span className="note-pin" />
                  {newEvidence === id && (
                    <LeafBurst seed={state.toolsUsed.indexOf(id)} />
                  )}
                  <EvidenceCard
                    title={item.name}
                    readout={item.note}
                    isNew={newEvidence === id}
                    pinned={state.pinnedClues.includes(id)}
                    onPin={() => dispatch({ type: "PIN_CLUE", id })}
                  />
                  <InvestigationVisual id={id} />
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="hint-card">
        <Restorer mood="thinking" size={54} />
        <div>
          <small>FIELD GUIDE HINT · COSTS 2 PTS</small>
          <p>
            {state.hintUsed
              ? "Look at which clues rule things out, not just the ones that fit."
              : "Rainfall looks normal. What else could remove water from a marsh?"}
          </p>
        </div>
        <button
          aria-label="Use a hint for 2 points"
          disabled={state.hintUsed || state.investigationPoints < 2}
          onClick={() => {
            dispatch({ type: "USE_HINT" });
            setScanHint("Your field guide shares a quiet clue.");
          }}
        >
          <CircleHelp aria-hidden="true" />
        </button>
      </div>
      <div className="sticky-action">
        <div>
          <strong>Ready to diagnose?</strong>
          <small>
            {state.toolsUsed.length < 3
              ? `${3 - state.toolsUsed.length} more clues needed`
              : "Your notes will be waiting if you come back"}
          </small>
        </div>
        <ChunkyButton
          disabled={state.toolsUsed.length < 3 || Boolean(scanning)}
          onClick={() => dispatch({ type: "SET_STAGE", stage: "Diagnose" })}
        >
          Ready to Diagnose <Search aria-hidden="true" />
        </ChunkyButton>
      </div>
      {state.toast && (
        <button
          className="inline-toast"
          onClick={() => dispatch({ type: "SET_TOAST", message: "" })}
        >
          {state.toast}
          <X aria-hidden="true" />
        </button>
      )}
      <BottomSheet
        open={notebookOpen}
        onClose={() => setNotebookOpen(false)}
        title={`Suspect list · ${state.pinnedClues.length} pinned clues`}
      >
        <p>Compare the evidence you pinned across the possible causes.</p>
        {causes.map((cause) => {
          const entries = pinnedCauses(cause.id);
          return (
            <section className="suspect-group" key={cause.id}>
              <h3>{cause.title}</h3>
              {entries.length ? (
                entries.map((entry) => (
                  <EvidenceCard
                    key={entry.id}
                    title={entry.title}
                    readout={
                      investigationTools.find((tool) => tool.id === entry.id)
                        ?.note ?? ""
                    }
                    relation={entry.relation}
                    onPin={() => dispatch({ type: "PIN_CLUE", id: entry.id })}
                    pinned
                  />
                ))
              ) : (
                <small>No pinned evidence for this cause yet.</small>
              )}
            </section>
          );
        })}
        <section className="suspect-group">
          <h3>Context</h3>
          {state.pinnedClues
            .filter(
              (id) => !causes.some((cause) => toolEvidence[id]?.[cause.id]),
            )
            .map((id) => (
              <p key={id}>
                {investigationTools.find((tool) => tool.id === id)?.name}: does
                not point to a listed cause.
              </p>
            ))}
        </section>
      </BottomSheet>
    </>
  );
}
