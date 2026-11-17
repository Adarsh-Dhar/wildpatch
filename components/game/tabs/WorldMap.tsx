"use client";

import { memo, useCallback, useRef, useState, type PointerEvent } from "react";
import {
  ChevronDown,
  Compass,
  Info,
  LockKeyhole,
  Shield,
  TreePine,
  Waves,
} from "lucide-react";
import { useGame } from "@/lib/engine/store";
import { useGameData } from "@/lib/data/context";
import { useSettings } from "@/lib/ui/settings-context";
import { ParcelTile } from "../art/ParcelTile";
import { StatusLegendIcon } from "../art/StatusIcon";
import { Blight } from "../art/Blight";
import { BirdFlock, Cloud } from "../art/WorldOrnaments";
import { BottomSheet, Chip, ConditionMeter } from "../ui-kit";
import { StageStepper } from "../ui-kit";
import type { Parcel, ParcelStatus } from "@/lib/types";

const filters = ["All", "Degraded", "Recovering", "Mine"] as const;
const visibleStatus: Record<
  Exclude<(typeof filters)[number], "All" | "Mine">,
  ParcelStatus
> = { Degraded: "degraded", Recovering: "recovering" };
const statuses: ParcelStatus[] = [
  "healthy",
  "degraded",
  "under-restoration",
  "recovering",
  "protected",
];
const biomeTitles = {
  forest: "Forest",
  wetland: "Wetland",
  grassland: "Grassland",
  mountain: "Mountain",
};

const MapParcel = memo(function MapParcel({
  parcel,
  index,
  dim,
  onSelect,
}: {
  parcel: Parcel;
  index: number;
  dim: boolean;
  onSelect: (parcel: Parcel) => void;
}) {
  const column = index % 6;
  const row = Math.floor(index / 6);
  const offset = row % 2 ? 42 : 0;
  return (
    <div
      className={`map-parcel-position ${dim ? "parcel-dimmed" : ""}`}
      style={{
        left: `${7 + column * 14}%`,
        top: `${10 + row * 21}%`,
        transform: `translate(${offset}px, 0)`,
      }}
    >
      <ParcelTile
        biome={parcel.biome}
        status={parcel.status}
        today={parcel.today}
        size={76}
        label={parcel.id}
        onClick={() => onSelect(parcel)}
      />
    </div>
  );
});

export function WorldMap() {
  const { dispatch } = useGame();
  const { settings } = useSettings();
  const { parcels, species } = useGameData();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    x: number;
    y: number;
    distance: number;
    view: typeof view;
  } | null>(null);
  const reduced = settings.reducedMotion;
  const onSelect = useCallback(
    (parcel: Parcel) => setSelectedParcel(parcel),
    [],
  );
  const activeCounts = {
    All: parcels.length,
    Degraded: parcels.filter((parcel) => parcel.status === "degraded").length,
    Recovering: parcels.filter((parcel) => parcel.status === "recovering")
      .length,
    Mine: 1,
  };
  const matches = (parcel: Parcel) =>
    filter === "All" || filter === "Mine"
      ? filter === "All" || parcel.today
      : parcel.status === visibleStatus[filter];

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const points = Array.from(pointers.current.values());
    gesture.current = {
      x: points.length > 1 ? (points[0].x + points[1].x) / 2 : points[0].x,
      y: points.length > 1 ? (points[0].y + points[1].y) / 2 : points[0].y,
      distance:
        points.length > 1
          ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
          : 0,
      view,
    };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const points = Array.from(pointers.current.values());
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX =
      points.length > 1 ? (points[0].x + points[1].x) / 2 : points[0].x;
    const centerY =
      points.length > 1 ? (points[0].y + points[1].y) / 2 : points[0].y;
    const distance =
      points.length > 1
        ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
        : gesture.current.distance;
    const scale =
      points.length > 1
        ? Math.max(
            0.8,
            Math.min(
              1.8,
              (gesture.current.view.scale * distance) /
                Math.max(1, gesture.current.distance),
            ),
          )
        : gesture.current.view.scale;
    const maxX = (Math.max(rect.width * 1.5, 700) * scale - rect.width) / 2;
    const maxY = (Math.max(rect.height * 1.4, 560) * scale - rect.height) / 2;
    setView({
      x: Math.max(
        -maxX,
        Math.min(maxX, gesture.current.view.x + centerX - gesture.current.x),
      ),
      y: Math.max(
        -maxY,
        Math.min(maxY, gesture.current.view.y + centerY - gesture.current.y),
      ),
      scale,
    });
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    gesture.current = null;
  };
  const selectedAction =
    selectedParcel?.today && selectedParcel.status === "degraded"
      ? "Investigate"
      : selectedParcel?.status === "degraded"
        ? "Investigate"
        : selectedParcel?.status === "recovering" ||
            selectedParcel?.status === "under-restoration"
          ? "View recovery"
          : selectedParcel?.status === "healthy"
            ? "Visit"
            : null;

  return (
    <>
      <div className="section-heading">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> YOUR FIELD ATLAS
        </div>
        <h1>
          A world in <em>the making.</em>
        </h1>
        <p>
          Every patch of wild has a story. Yours is part of a much bigger one.
        </p>
      </div>
      <div className="world-map-heading">
        <span className="eyebrow">WILDPATCH WORLD · 24 PARCELS</span>
        <button
          className="legend-button"
          aria-label="Show map legend"
          onClick={() => setLegendOpen(true)}
        >
          <Info aria-hidden="true" /> Legend
        </button>
      </div>
      <div
        ref={viewportRef}
        className="atlas-viewport"
        aria-label="Pannable isometric restoration world"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={(event) =>
          setView((current) => ({
            ...current,
            scale: Math.max(
              0.8,
              Math.min(1.8, current.scale + (event.deltaY < 0 ? 0.1 : -0.1)),
            ),
          }))
        }
      >
        <div
          className="atlas-world"
          style={{
            transform: `translate3d(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px),0) scale(${view.scale})`,
          }}
        >
          <div className="atlas-river" />
          <Cloud className="cloud-a" />
          <Cloud className="cloud-b" />
          {!reduced && <BirdFlock />}
          <div className="region-ribbon ribbon-forest">
            <TreePine aria-hidden="true" /> FOREST
          </div>
          <div className="region-ribbon ribbon-wetland">
            <Waves aria-hidden="true" /> WETLAND
          </div>
          <div className="region-ribbon ribbon-grassland">GRASSLAND</div>
          <div className="region-ribbon ribbon-mountain">
            <Shield aria-hidden="true" /> MOUNTAIN{" "}
            <small>UNLOCKS AT LEVEL 8</small>
            <LockKeyhole aria-hidden="true" />
          </div>
          <div className="map-tile-grid">
            {parcels.map((parcel, index) => (
              <MapParcel
                key={parcel.id}
                parcel={parcel}
                index={index}
                dim={!matches(parcel)}
                onSelect={onSelect}
              />
            ))}
          </div>
          <Blight mood="sneaky" size={56} className="map-blight" />
        </div>
        <div className="atlas-controls">
          <button
            aria-label="Zoom in"
            onClick={() =>
              setView((current) => ({
                ...current,
                scale: Math.min(1.8, current.scale + 0.12),
              }))
            }
          >
            +
          </button>
          <button
            aria-label="Zoom out"
            onClick={() =>
              setView((current) => ({
                ...current,
                scale: Math.max(0.8, current.scale - 0.12),
              }))
            }
          >
            −
          </button>
          <button
            aria-label="Recenter map"
            onClick={() => setView({ x: 0, y: 0, scale: 1 })}
          >
            <Compass aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="map-filter-row">
        {filters.map((item) => (
          <Chip
            key={item}
            selected={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
            <small>{activeCounts[item]}</small>
          </Chip>
        ))}
      </div>
      <button
        className="world-status-toggle"
        aria-expanded={showStats}
        onClick={() => setShowStats((value) => !value)}
      >
        <span>
          <strong>World status</strong>
          <small>Illustrative game stats</small>
        </span>
        <ChevronDown
          className={showStats ? "rotate-chevron" : ""}
          aria-hidden="true"
        />
      </button>
      {showStats && (
        <section className="world-stats">
          <div className="world-stats-grid">
            <span>
              ● 68%<small>Healthy</small>
            </span>
            <span>
              ⌁ 22%<small>Degraded</small>
            </span>
            <span>
              ⚒ 7%<small>Under restoration</small>
            </span>
            <span>
              ✿ 3%<small>Recovering</small>
            </span>
          </div>
          <div className="world-bar">
            <i />
            <i />
            <i />
            <i />
          </div>
        </section>
      )}
      <div className="map-legend-copy">
        Drag to explore · pinch or use +/− to zoom
      </div>
      <BottomSheet
        open={Boolean(selectedParcel)}
        onClose={() => setSelectedParcel(null)}
        title={
          selectedParcel
            ? `${selectedParcel.name} · ${selectedParcel.id}`
            : "Field parcel"
        }
      >
        {selectedParcel && (
          <div className="parcel-details">
            <div className="parcel-detail-badges">
              <span>{biomeTitles[selectedParcel.biome]}</span>
              <StatusLegendIcon status={selectedParcel.status} />
              <strong>{selectedParcel.status.replace("-", " ")}</strong>
            </div>
            <p>
              {selectedParcel.today
                ? "Today’s challenge parcel. The cause is still yours to discover."
                : selectedParcel.status === "recovering" ||
                    selectedParcel.status === "under-restoration"
                  ? "This landscape is beginning to recover."
                  : selectedParcel.status === "healthy"
                    ? "A thriving habitat with room for wildlife."
                    : "A restoration opportunity is waiting for a future challenge."}
            </p>
            {selectedParcel.status === "healthy" && (
              <div className="parcel-visit-species">
                <strong>Wildlife spotted nearby</strong>
                <div>
                  {species
                    .filter((item) => item.discovered)
                    .slice(0, 3)
                    .map((item) => (
                      <span key={item.name}>
                        <strong>{item.name}</strong>
                        <small>{item.habitat}</small>
                      </span>
                    ))}
                </div>
              </div>
            )}
            <div className="parcel-condition-grid">
              {(["water", "soil", "vegetation", "biodiversity"] as const).map(
                (key) => (
                  <ConditionMeter
                    key={key}
                    label={key[0].toUpperCase() + key.slice(1)}
                    value={selectedParcel.conditions[key]}
                  />
                ),
              )}
            </div>
            {(selectedParcel.status === "recovering" ||
              selectedParcel.status === "under-restoration") && (
              <StageStepper stage="Early recovery" />
            )}
            <h3>Field history</h3>
            <ol className="parcel-history">
              {selectedParcel.history.map((entry) => (
                <li key={`${entry.day}-${entry.title}`}>
                  <b>Day {entry.day}</b>
                  <strong>{entry.title}</strong>
                  <small>{entry.note}</small>
                </li>
              ))}
            </ol>
            {selectedParcel.status === "protected" && (
              <p className="disabled-reason">
                Protected restoration period: 3 days left.
              </p>
            )}
            {selectedParcel.status === "degraded" && !selectedParcel.today && (
              <p className="disabled-reason">
                Only today&apos;s challenge parcel is open. New parcels unlock
                daily.
              </p>
            )}
            {selectedAction && (
              <button
                className="primary-button full"
                disabled={
                  selectedParcel.status === "degraded" && !selectedParcel.today
                }
                onClick={() => {
                  if (
                    selectedParcel.status === "degraded" &&
                    selectedParcel.today
                  ) {
                    dispatch({ type: "SET_TAB", tab: "Today" });
                    dispatch({ type: "SET_STAGE", stage: "Briefing" });
                  }
                  setSelectedParcel(null);
                }}
              >
                {selectedAction}
              </button>
            )}
          </div>
        )}
      </BottomSheet>
      <BottomSheet
        open={legendOpen}
        onClose={() => setLegendOpen(false)}
        title="Map legend"
      >
        <p>Every status uses a distinct shape and label as well as a color.</p>
        <div className="status-legend-list">
          {statuses.map((status) => (
            <div key={status}>
              <StatusLegendIcon status={status} />
              <strong>{status.replace("-", " ")}</strong>
              <small>
                {status === "degraded"
                  ? "Needs careful diagnosis"
                  : status === "recovering"
                    ? "Showing early signs of recovery"
                    : status === "under-restoration"
                      ? "An active plan is underway"
                      : status === "protected"
                        ? "Protected for a recovery period"
                        : "Stable habitat conditions"}
              </small>
            </div>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
