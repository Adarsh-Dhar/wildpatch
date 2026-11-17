"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { Check, Grid2X2, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { projectConditions } from "@/lib/engine/actions";
import { restorationActions } from "@/lib/engine/actions";
import { useGameData } from "@/lib/data/context";
import { useGame } from "@/lib/engine/store";
import { assetUrl } from "@/lib/config";
import { useSettings } from "@/lib/ui/settings-context";
import type { ActionId, Conditions } from "@/lib/types";
import { ConditionMeter } from "../game/ui-kit";
import { ActionToken } from "./ActionToken";

const zones = [
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
export function WildpatchField({ simulate = false }: { simulate?: boolean }) {
  const { state, dispatch } = useGame();
  const { settings, updateSetting } = useSettings();
  const { scenario } = useGameData();
  const initialConditions = scenario.conditions;
  const fieldRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const start = useRef<{
    x: number;
    y: number;
    distance: number;
    view: { x: number; y: number; scale: number };
  } | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [selectedPiece, setSelectedPiece] = useState<ActionId | null>(null);
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
          sum +
          projected[key as keyof Conditions] -
          initialConditions[key as keyof Conditions],
        0,
      ) / 65,
    ),
  );
  const startedHydrology = state.plan.some(
    (id) =>
      restorationActions.find((item) => item.id === id)?.group === "Hydrology",
  );

  const updatePointer = (event: PointerEvent<HTMLElement>) => {
    const values = Array.from(pointers.current.values());
    if (!start.current || !values.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const center =
      values.length > 1
        ? {
            x: (values[0].x + values[1].x) / 2,
            y: (values[0].y + values[1].y) / 2,
          }
        : values[0];
    const distance =
      values.length > 1
        ? Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y)
        : start.current.distance;
    const scale =
      values.length > 1
        ? Math.max(
            0.8,
            Math.min(
              1.8,
              (start.current.view.scale * distance) /
                Math.max(1, start.current.distance),
            ),
          )
        : start.current.view.scale;
    const worldW = Math.max(rect.width, window.innerHeight * 0.85);
    const worldH = Math.max(rect.height, window.innerHeight * 0.56);
    const maxX = Math.max(0, (worldW * scale - rect.width) / 2);
    const maxY = Math.max(0, (worldH * scale - rect.height) / 2);
    setView({
      x: Math.max(
        -maxX,
        Math.min(maxX, start.current.view.x + center.x - start.current.x),
      ),
      y: Math.max(
        -maxY,
        Math.min(maxY, start.current.view.y + center.y - start.current.y),
      ),
      scale,
    });
  };
  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button,input")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const values = Array.from(pointers.current.values());
    start.current = {
      x: values.length > 1 ? (values[0].x + values[1].x) / 2 : values[0].x,
      y: values.length > 1 ? (values[0].y + values[1].y) / 2 : values[0].y,
      distance:
        values.length > 1
          ? Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y)
          : 0,
      view,
    };
  };
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    updatePointer(event);
  };
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    pointers.current.delete(event.pointerId);
    start.current = null;
  };
  const movePiece = (id: ActionId, event: PointerEvent<HTMLButtonElement>) => {
    if (event.buttons === 0 || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const worldW = Math.max(rect.width, window.innerHeight * 0.85);
    const worldH = Math.max(rect.height, window.innerHeight * 0.56);
    const worldLeft =
      rect.left + rect.width / 2 + view.x - (worldW * view.scale) / 2;
    const worldTop =
      rect.top + rect.height / 2 + view.y - (worldH * view.scale) / 2;
    const x = ((event.clientX - worldLeft) / view.scale / worldW) * 100;
    const y = ((event.clientY - worldTop) / view.scale / worldH) * 100;
    const zone = zones.reduce(
      (nearest, item) =>
        Math.hypot(item.x - x, item.y - y) <
        Math.hypot(nearest.x - x, nearest.y - y)
          ? item
          : nearest,
      zones[0],
    );
    dispatch({ type: "MOVE_PIECE", id, x: zone.x, y: zone.y, zone: zone.id });
  };
  return (
    <section className="restore-field-wrap">
      <div
        ref={fieldRef}
        className="restore-field"
        aria-label="Willow Fen restoration field"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="restore-world"
          style={{
            transform: `translate3d(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px), 0) scale(${view.scale})`,
          }}
        >
          <img
            className="restore-land restore-land-dry"
            src={assetUrl("wetland-dry.webp")}
            alt="Degraded Willow Fen field"
            draggable={false}
          />
          <img
            className="restore-land restore-land-recovering"
            src={assetUrl("wetland-recovering.webp")}
            alt="Projected recovering Willow Fen field"
            draggable={false}
            style={{ opacity: restorationPercent }}
          />
          {settings.placementGrid && (
            <div className="restore-grid" aria-hidden="true" />
          )}
          <div className="restore-zones">
            {zones.map((zone) => (
              <span
                key={zone.id}
                className="restore-zone-label"
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
              >
                {zone.label}
              </span>
            ))}
          </div>
          {state.fieldPieces.map((piece) => {
            const action = restorationActions.find(
              (item) => item.id === piece.actionId,
            )!;
            return (
              <button
                key={piece.actionId}
                type="button"
                className={`restore-piece ${selectedPiece === piece.actionId ? "restore-piece-selected" : ""}`}
                style={{ left: `${piece.x}%`, top: `${piece.y}%` }}
                aria-label={`${action.name} at ${zones.find((zone) => zone.id === piece.zone)?.label ?? piece.zone}. Drag to move.`}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  setSelectedPiece(piece.actionId);
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  event.stopPropagation();
                  movePiece(piece.actionId, event);
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <span className="restore-piece-art">
                  {art[action.id] ? (
                    <img src={art[action.id]} alt="" draggable={false} />
                  ) : (
                    <span className={`token-${action.icon}`}>
                      <ActionToken actionId={action.id} />
                    </span>
                  )}
                </span>
                <span className="restore-piece-label">{action.name}</span>
              </button>
            );
          })}
        </div>
        <span className="restore-field-coordinates">
          WILLOW FEN · WETLAND 04
        </span>
        <div className="restore-field-controls">
          <button
            aria-label="Zoom in"
            onClick={() =>
              setView((value) => ({
                ...value,
                scale: Math.min(1.8, value.scale + 0.12),
              }))
            }
          >
            <Plus aria-hidden="true" />
          </button>
          <button
            aria-label="Zoom out"
            onClick={() =>
              setView((value) => ({
                ...value,
                scale: Math.max(0.8, value.scale - 0.12),
              }))
            }
          >
            <Minus aria-hidden="true" />
          </button>
          <button
            aria-label="Recenter field"
            onClick={() => setView({ x: 0, y: 0, scale: 1 })}
          >
            <RotateCcw aria-hidden="true" />
          </button>
          <button
            aria-label="Toggle placement grid"
            aria-pressed={settings.placementGrid}
            onClick={() =>
              updateSetting("placementGrid", !settings.placementGrid)
            }
          >
            <Grid2X2 aria-hidden="true" />
          </button>
        </div>
      </div>
      {simulate && (
        <div className="projection-panel">
          <strong>Projection, not a result</strong>
          <div>
            {(["water", "soil", "vegetation", "biodiversity"] as const).map(
              (key) => (
                <ConditionMeter
                  key={key}
                  label={
                    key === "biodiversity"
                      ? "Biodiversity"
                      : key[0].toUpperCase() + key.slice(1)
                  }
                  from={initialConditions[key]}
                  value={projected[key]}
                  delta={projected[key] - initialConditions[key]}
                />
              ),
            )}
          </div>
        </div>
      )}
      {selectedPiece && (
        <div className="selected-piece-actions">
          <span>
            {
              zones.find(
                (zone) =>
                  zone.id ===
                  state.fieldPieces.find(
                    (item) => item.actionId === selectedPiece,
                  )?.zone,
              )?.label
            }
          </span>
          <button
            aria-label="Remove action from field"
            onClick={() => {
              dispatch({ type: "REMOVE_ACTION", id: selectedPiece });
              setSelectedPiece(null);
            }}
          >
            <Trash2 aria-hidden="true" /> Remove action
          </button>
          {startedHydrology && (
            <span>
              <Check aria-hidden="true" /> Hydrology active
            </span>
          )}
        </div>
      )}
    </section>
  );
}
