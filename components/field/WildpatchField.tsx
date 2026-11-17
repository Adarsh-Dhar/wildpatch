"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { Droplets, Grid2X2, Leaf, Minus, PawPrint, Plus, RotateCcw, Search, Shovel, TriangleAlert, X } from "lucide-react";
import { actionCost, projectConditions, isActionZoneValid, restorationActions } from "@/lib/engine/actions";
import { investigationToolZones } from "@/lib/engine/scenario";
import { useGame } from "@/lib/engine/store";
import { useGameData } from "@/lib/data/context";
import { assetUrl } from "@/lib/config";
import { useSettings } from "@/lib/ui/settings-context";
import { useDrag } from "@/lib/hooks/useDrag";
import type { ActionId, Conditions, FieldZone, ToolId } from "@/lib/types";
import { ConditionMeter } from "../game/ui-kit";
import { ActionToken } from "./ActionToken";
import { InvestigationVisual } from "../game/steps/InvestigationVisual";

const zones: { id: FieldZone; label: string; x: number; y: number }[] = [
  { id: "ditch", label: "Drainage ditch", x: 27, y: 34 },
  { id: "stream", label: "Inflow stream", x: 68, y: 30 },
  { id: "marsh", label: "Central marsh", x: 50, y: 57 },
  { id: "bank", label: "Eastern bank", x: 77, y: 70 },
  { id: "upland", label: "Upland edge", x: 23, y: 75 },
];
const art: Partial<Record<ActionId, string>> = {
  "block-ditch": assetUrl("water-gate.png"),
  "restore-flow": assetUrl("water-gate.png"),
  "plant-sedges": assetUrl("sedge-patch.png"),
  "monitor-water": assetUrl("water-sensor.png"),
  "habitat-corridor": assetUrl("habitat-grove.png"),
  "wind-pump": assetUrl("wind-turbine.png"),
};
type Point = { x: number; y: number };
const vagueReadout = "Not much to see here. Try another part of the fen.";
const actionGroups = ["All", "Hydrology", "Planting", "Invasives", "Erosion", "Water quality", "Habitat"] as const;
const toolLabels: Record<ToolId, string> = {
  water: "Water probe",
  soil: "Soil auger",
  vegetation: "Quadrat frame",
  wildlife: "Binoculars",
  historical: "Map case",
  terrain: "Survey drone",
  habitat: "Habitat frame",
  records: "Rain gauge",
  quick: "Look around",
};
type SceneMode = "briefing" | "investigate" | "diagnose" | "restore" | "report";

export function WildpatchField({
  mode = "restore",
  simulate = false,
}: {
  mode?: SceneMode;
  simulate?: boolean;
}) {
  const { state, dispatch } = useGame();
  const { settings, updateSetting } = useSettings();
  const { scenario, investigationTools } = useGameData();
  const { registerDropZone, startDrag, isOver, active } = useDrag();
  const initialConditions = scenario.conditions;
  const fieldRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{
    x: number;
    y: number;
    distance: number;
    view: { x: number; y: number; scale: number };
  } | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [scanZone, setScanZone] = useState<FieldZone | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [selectedActionGroup, setSelectedActionGroup] = useState<(typeof actionGroups)[number]>("All");
  const [openReading, setOpenReading] = useState<ToolId | null>(null);
  const selectedPiece = state.plan.find(
    (piece) => piece.id === state.selectedPieceId,
  );
  const trayActions = restorationActions.filter(
    (action) => selectedActionGroup === "All" || action.group === selectedActionGroup,
  );
  const projected = useMemo(
    () => projectConditions(state.plan, initialConditions),
    [state.plan, initialConditions],
  );
  const restorationPercent = Math.max(
    0,
    Math.min(
      1,
      Object.keys(projected).reduce(
        (sum, key) =>
          sum + projected[key as keyof Conditions] - initialConditions[key as keyof Conditions],
        0,
      ) / 65,
    ),
  );
  const startedHydrology = state.plan.some((piece) =>
    ["block-ditch", "restore-flow"].includes(piece.actionId),
  );
  const fieldComponents = [
    { id: "hydrology", label: "Water", icon: Droplets, x: 37, y: 39 },
    { id: "soil", label: "Soil", icon: Shovel, x: 25, y: 63 },
    { id: "vegetation", label: "Plants", icon: Leaf, x: 51, y: 69 },
    { id: "wildlife", label: "Wildlife", icon: PawPrint, x: 77, y: 54 },
    { id: "waterQuality", label: "Water quality", icon: Search, x: 66, y: 41 },
  ] as const;

  const toWorldPoint = (point: { x: number; y: number }) => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 57 };
    const worldW = Math.max(rect.width, window.innerHeight * 0.85);
    const worldH = Math.max(rect.height, window.innerHeight * 0.56);
    const left = rect.left + rect.width / 2 + view.x - (worldW * view.scale) / 2;
    const top = rect.top + rect.height / 2 + view.y - (worldH * view.scale) / 2;
    return {
      x: Math.max(4, Math.min(96, ((point.x - left) / view.scale / worldW) * 100)),
      y: Math.max(8, Math.min(92, ((point.y - top) / view.scale / worldH) * 100)),
    };
  };
  const placeTool = (toolId: ToolId, zone: FieldZone, x: number, y: number) => {
    if (state.toolsUsed.includes(toolId)) return;
    const valid = investigationToolZones[toolId].includes(zone);
    if (!valid) dispatch({ type: "SET_TOAST", message: "Not much to see here. Try another part of the fen." });
    setScanZone(zone);
    window.setTimeout(() => {
      dispatch({ type: "USE_TOOL", id: toolId, zone, x, y, valid });
      setScanZone(null);
    }, 650);
  };
  const dropOnZone = (
    payload: { kind: string; id: string },
    zoneId: string,
    point: { x: number; y: number },
  ) => {
    const zone = zoneId as FieldZone;
    const target = zones.find((item) => item.id === zone);
    if (!target) return;
    const position = toWorldPoint(point);
    if (payload.kind === "tool") {
      placeTool(payload.id as ToolId, zone, position.x, position.y);
      setSelectedTool(null);
    }
    if (payload.kind === "action") {
      const actionId = payload.id as ActionId;
      if (!isActionZoneValid(actionId, zone)) {
        dispatch({ type: "SET_TOAST", message: "Placed outside the preferred zone. The verifier may not credit this." });
      }
      dispatch({ type: "ADD_ACTION", id: actionId, zone, x: position.x, y: position.y });
      dispatch({ type: "CELEBRATE" });
    }
  };
  const zoneDropClass = (zone: FieldZone) => {
    if (!active || !isOver(zone)) return "";
    const valid = active.kind === "tool"
      ? investigationToolZones[active.id as ToolId].includes(zone)
      : active.kind === "action"
        ? isActionZoneValid(active.id as ActionId, zone)
        : false;
    return valid ? "drop-zone-active" : "drop-zone-invalid";
  };
  const registerZone = (zone: FieldZone) =>
    registerDropZone(zone, ["tool", "action"], dropOnZone);
  const zoneClick = (zone: (typeof zones)[number]) => {
    if (mode === "investigate" && selectedTool) {
      placeTool(selectedTool, zone.id, zone.x, zone.y);
      setSelectedTool(null);
    }
  };

  const updatePan = (event: PointerEvent<HTMLElement>) => {
    const points = Array.from(pointers.current.values());
    if (!gesture.current || !points.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const center = points.length > 1
      ? { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }
      : points[0];
    const distance = points.length > 1
      ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
      : gesture.current.distance;
    const scale = points.length > 1
      ? Math.max(0.8, Math.min(1.8, gesture.current.view.scale * distance / Math.max(1, gesture.current.distance)))
      : gesture.current.view.scale;
    const worldW = Math.max(rect.width, window.innerHeight * 0.85);
    const worldH = Math.max(rect.height, window.innerHeight * 0.56);
    const maxX = Math.max(0, (worldW * scale - rect.width) / 2);
    const maxY = Math.max(0, (worldH * scale - rect.height) / 2);
    setView({
      x: Math.max(-maxX, Math.min(maxX, gesture.current.view.x + center.x - gesture.current.x)),
      y: Math.max(-maxY, Math.min(maxY, gesture.current.view.y + center.y - gesture.current.y)),
      scale,
    });
  };
  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button,input")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(pointers.current.values());
    gesture.current = {
      x: points.length > 1 ? (points[0].x + points[1].x) / 2 : points[0].x,
      y: points.length > 1 ? (points[0].y + points[1].y) / 2 : points[0].y,
      distance: points.length > 1 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0,
      view,
    };
  };
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    updatePan(event);
  };
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    pointers.current.delete(event.pointerId);
    gesture.current = null;
  };
  const movePiece = (id: ActionId, event: PointerEvent<HTMLButtonElement>) => {
    if (event.buttons === 0 || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const worldW = Math.max(rect.width, window.innerHeight * 0.85);
    const worldH = Math.max(rect.height, window.innerHeight * 0.56);
    const left = rect.left + rect.width / 2 + view.x - (worldW * view.scale) / 2;
    const top = rect.top + rect.height / 2 + view.y - (worldH * view.scale) / 2;
    const x = Math.max(4, Math.min(96, ((event.clientX - left) / view.scale / worldW) * 100));
    const y = Math.max(8, Math.min(92, ((event.clientY - top) / view.scale / worldH) * 100));
    const nearest = zones.reduce((best, zone) =>
      Math.hypot(zone.x - x, zone.y - y) < Math.hypot(best.x - x, best.y - y) ? zone : best,
    zones[0]);
    dispatch({ type: "MOVE_PIECE", id, x, y, zone: nearest.id });
  };
  const toolDrag = (event: PointerEvent<HTMLButtonElement>, id: ToolId, name: string) =>
    startDrag(event, { kind: "tool", id, label: name });
  const actionDrag = (event: PointerEvent<HTMLButtonElement>, id: ActionId, name: string) =>
    startDrag(event, { kind: "action", id, label: name });

  return (
    <section className={`restore-field-wrap scene-${mode}`} aria-label="Willow Fen interactive field">
      <div
        ref={fieldRef}
        className={`restore-field ${scanZone ? "site-scanning" : ""}`}
        aria-label="Willow Fen field. Drag or pinch empty land to move the map."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="restore-world" style={{ transform: `translate3d(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px), 0) scale(${view.scale})` }}>
          <img className="restore-land restore-land-dry" src={assetUrl("wetland-dry.webp")} alt="Willow Fen wetlands with a drainage channel" draggable={false} />
          <img className="restore-land restore-land-recovering" src={assetUrl("wetland-recovering.webp")} alt="Projected recovery of the Willow Fen wetlands" draggable={false} style={{ opacity: restorationPercent }} />
          {settings.placementGrid && <div className="restore-grid" aria-hidden="true" />}
          <div className="restore-zones">
            {zones.map((zone) => (
              <button
                key={zone.id}
                type="button"
                ref={registerZone(zone.id)}
                className={`restore-zone-label ${zoneDropClass(zone.id)} ${scanZone === zone.id ? "zone-scanning" : ""}`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                aria-label={`Drop zone: ${zone.label}`}
                onClick={() => zoneClick(zone)}
              >
                {zone.label}
              </button>
            ))}
          </div>
          {mode === "diagnose" && (
            <div className="field-component-nodes" aria-label="Select affected components on the land">
              {fieldComponents.map(({ id, label, icon: Icon, x, y }) => (
                <button
                  key={id}
                  type="button"
                  className={state.components.includes(id) ? "component-node component-node-selected" : "component-node"}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  aria-pressed={state.components.includes(id)}
                  onClick={() => dispatch({ type: "TOGGLE_COMPONENT", component: id })}
                >
                  <Icon aria-hidden="true" /> {label}
                </button>
              ))}
            </div>
          )}
          {state.toolsUsed.map((toolId) => {
            const position = state.toolPlacements[toolId] ?? { x: 50, y: 57, zone: "marsh" as FieldZone };
            const tool = investigationTools.find((item) => item.id === toolId)!;
            return (
              <button
                key={toolId}
                type="button"
                className={`field-evidence-flag ${(state.toolPlacements[toolId]?.valid ?? true) ? "" : "flag-vague"} ${openReading === toolId ? "flag-open" : ""}`}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                aria-label={`Open ${tool.name} evidence at ${zones.find((zone) => zone.id === position.zone)?.label}`}
                onClick={() => setOpenReading((current) => current === toolId ? null : toolId)}
              >
                <Search aria-hidden="true" />
                <span>{tool.name}</span>
              </button>
            );
          })}
          {state.plan.length > 1 && (
            <svg className="piece-sequence" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={[...state.plan].sort((a, b) => a.order - b.order).map((piece) => `${piece.x},${piece.y}`).join(" ")} />
            </svg>
          )}
          {state.plan.map((piece) => {
            const action = restorationActions.find((item) => item.id === piece.actionId)!;
            const prerequisiteMissing = action.requires === "hydrology" && !state.plan.some((candidate) => candidate.order < piece.order && ["block-ditch", "restore-flow"].includes(candidate.actionId));
            const invalidPlacement = !isActionZoneValid(piece.actionId, piece.zone);
            return (
              <button
                key={piece.id}
                type="button"
                className={`restore-piece ${selectedPiece?.id === piece.id ? "restore-piece-selected" : ""} ${invalidPlacement ? "piece-invalid" : ""} ${prerequisiteMissing || action.warning ? "piece-warning" : ""}`}
                style={{ left: `${piece.x}%`, top: `${piece.y}%` }}
                aria-label={`Order ${piece.order}, ${action.name} at ${zones.find((zone) => zone.id === piece.zone)?.label}. Select or drag to move.`}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  dispatch({ type: "SELECT_PIECE", id: piece.id });
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onClick={() => dispatch({ type: "SELECT_PIECE", id: piece.id })}
                onPointerMove={(event) => {
                  event.stopPropagation();
                  movePiece(piece.actionId, event);
                }}
              >
                <span className="piece-order-badge">{piece.order}</span>
                {(invalidPlacement || prerequisiteMissing || action.warning) && (
                  <span className={`piece-warning-marker ${invalidPlacement ? "piece-warning-invalid" : ""}`} aria-label={invalidPlacement ? "Wrong placement zone" : action.warning ?? "Requires hydrology first"} title={invalidPlacement ? "Wrong placement zone" : action.warning ?? "Requires hydrology first"}>
                    {invalidPlacement ? <X aria-hidden="true" /> : <TriangleAlert aria-hidden="true" />}
                  </span>
                )}
                <span className="restore-piece-art">
                  {art[action.id] ? <img src={art[action.id]} alt="" draggable={false} /> : <ActionToken actionId={action.id} />}
                </span>
                <span className="restore-piece-label">{action.name}</span>
              </button>
            );
          })}
          {openReading && (
            <aside className="field-reading-popover" aria-label="Field reading">
              <button aria-label="Close field reading" onClick={() => setOpenReading(null)}><X aria-hidden="true" /></button>
              {state.toolPlacements[openReading]?.valid === false ? (
                <p>{vagueReadout}</p>
              ) : (
                <InvestigationVisual id={openReading} />
              )}
            </aside>
          )}
          {scanZone && <span className="field-scan-ring" style={{ left: `${zones.find((zone) => zone.id === scanZone)?.x}%`, top: `${zones.find((zone) => zone.id === scanZone)?.y}%` }} />}
        </div>
        <span className="restore-field-coordinates">WILLOW FEN · WETLAND 04</span>
        <div className="restore-field-controls">
          <button aria-label="Zoom in" onClick={() => setView((value) => ({ ...value, scale: Math.min(1.8, value.scale + 0.12) }))}><Plus aria-hidden="true" /></button>
          <button aria-label="Zoom out" onClick={() => setView((value) => ({ ...value, scale: Math.max(0.8, value.scale - 0.12) }))}><Minus aria-hidden="true" /></button>
          <button aria-label="Recenter field" onClick={() => setView({ x: 0, y: 0, scale: 1 })}><RotateCcw aria-hidden="true" /></button>
          <button aria-label="Toggle placement grid" aria-pressed={settings.placementGrid} onClick={() => updateSetting("placementGrid", !settings.placementGrid)}><Grid2X2 aria-hidden="true" /></button>
        </div>
      </div>
      {mode === "investigate" && (
        <div className="field-tool-belt investigation-tool-belt" aria-label="Investigation tool belt">
          {investigationTools.map((tool) => {
            const used = state.toolsUsed.includes(tool.id);
            return (
              <button
                key={tool.id}
                type="button"
                className={`field-tool-token ${selectedTool === tool.id ? "tool-token-selected" : ""} ${used ? "tool-token-used" : ""}`}
                disabled={used}
                aria-pressed={selectedTool === tool.id}
                aria-label={`${toolLabels[tool.id]}, ${used ? "already used" : tool.cost === 0 ? "free" : `${tool.cost} research points`}`}
                onPointerDown={(event) => !used && toolDrag(event, tool.id, toolLabels[tool.id])}
                onClick={() => setSelectedTool((current) => current === tool.id ? null : tool.id)}
              >
                <Search aria-hidden="true" />
                <span>{toolLabels[tool.id]}</span>
                <small>{tool.cost ? `${tool.cost} pts` : "free"}</small>
                {used && <b aria-hidden="true">✓</b>}
              </button>
            );
          })}
        </div>
      )}
      {mode === "restore" && (
        <div className="field-tool-belt restore-tool-belt" aria-label="Restoration component tray">
          <div className="field-tray-categories" role="group" aria-label="Filter components by category">
            {actionGroups.map((group) => (
              <button key={group} type="button" className={selectedActionGroup === group ? "tray-category-selected" : ""} aria-pressed={selectedActionGroup === group} onClick={() => setSelectedActionGroup(group)}>{group}</button>
            ))}
          </div>
          <div className="field-tray-items">
            {trayActions.map((action) => {
              const placed = state.plan.some((piece) => piece.actionId === action.id);
              return (
                <button
                  key={action.id}
                  type="button"
                  className={`field-tool-token ${placed ? "tool-token-used" : ""}`}
                  disabled={placed}
                  aria-label={`${action.name}, ${action.cost} credits${action.warning ? `. Warning: ${action.warning}` : ""}`}
                  onPointerDown={(event) => !placed && actionDrag(event, action.id, action.name)}
                  onClick={() => !placed && dispatch({ type: "ADD_ACTION", id: action.id })}
                >
                  <span className="field-token-art">{art[action.id] ? <img src={art[action.id]} alt="" /> : <ActionToken actionId={action.id} />}</span>
                  <span>{action.name}</span>
                  <small>{action.cost} cr</small>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {selectedPiece && (
        <aside className="piece-inspector">
          <strong>{selectedPiece.order}. {restorationActions.find((item) => item.id === selectedPiece.actionId)?.name}</strong>
          <span>{zones.find((zone) => zone.id === selectedPiece.zone)?.label}</span>
          <span>{actionCost(selectedPiece)} credits · {restorationActions.find((item) => item.id === selectedPiece.actionId)?.durationDays} days</span>
          {selectedPiece.actionId === "block-ditch" && <label>Gate opening · {selectedPiece.settings.openness ?? 20}%<input type="range" min="0" max="100" value={selectedPiece.settings.openness ?? 20} onChange={(event) => dispatch({ type: "UPDATE_PIECE_SETTING", id: selectedPiece.actionId, key: "openness", value: Number(event.target.value) })} /></label>}
          {selectedPiece.actionId === "plant-sedges" && <label>Plant density · {selectedPiece.settings.density ?? 3}<input type="range" min="1" max="5" value={selectedPiece.settings.density ?? 3} onChange={(event) => dispatch({ type: "UPDATE_PIECE_SETTING", id: selectedPiece.actionId, key: "density", value: Number(event.target.value) })} /></label>}
          {selectedPiece.actionId === "restore-flow" && <label>Channel width · {selectedPiece.settings.width ?? 2}<input type="range" min="1" max="3" value={selectedPiece.settings.width ?? 2} onChange={(event) => dispatch({ type: "UPDATE_PIECE_SETTING", id: selectedPiece.actionId, key: "width", value: Number(event.target.value) })} /></label>}
          <button aria-label="Remove selected component and refund credits" onClick={() => dispatch({ type: "REMOVE_ACTION", id: selectedPiece.actionId })}><X aria-hidden="true" /> Reclaim</button>
        </aside>
      )}
      {simulate && <div className="projection-panel"><strong>Projection, not a result</strong><div>{(["water", "soil", "vegetation", "biodiversity"] as const).map((key) => <ConditionMeter key={key} label={key === "biodiversity" ? "Biodiversity" : key[0].toUpperCase() + key.slice(1)} from={initialConditions[key]} value={projected[key]} delta={projected[key] - initialConditions[key]} />)}</div></div>}
    </section>
  );
}
