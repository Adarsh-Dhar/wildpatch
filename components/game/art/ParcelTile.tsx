import { memo } from "react";
import type { Biome, ParcelStatus } from "@/lib/types";
import { StatusIcon } from "./StatusIcon";
import { BlightWisp } from "./Blight";

const palettes: Record<Biome, { top: string; side: string }> = {
  forest: { top: "#829b69", side: "#526b45" },
  wetland: { top: "#83a899", side: "#587d76" },
  grassland: { top: "#b1a873", side: "#817d53" },
  mountain: { top: "#99a4a2", side: "#6e7c7b" },
};
export const ParcelTile = memo(function ParcelTile({
  biome,
  status,
  size = 82,
  label,
  today = false,
  selected = false,
  onClick,
}: {
  biome: Biome;
  status: ParcelStatus;
  size?: number;
  label?: string;
  today?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  const palette = palettes[biome];
  const isMountain = biome === "mountain";
  return (
    <button
      className={`parcel-tile parcel-${status} ${isMountain ? "parcel-mountain" : ""} ${today ? "parcel-today" : ""} ${selected ? "parcel-selected" : ""}`}
      style={{ width: size, height: size * 0.66 }}
      aria-label={`${label ?? biome}, ${status}${today ? ", today challenge" : ""}${isMountain ? ", locked" : ""}`}
      onClick={onClick}
      disabled={isMountain}
    >
      <svg aria-hidden="true" viewBox="0 0 100 66" className="parcel-tile-art">
        <path d="M50 4 96 27 50 51 4 27z" fill={palette.top} />
        <path d="M4 27 50 51v12L4 39z" fill={palette.side} />
        <path d="M96 27 50 51v12l46-24z" fill={palette.side} />
        {status === "degraded" && (
          <>
            <path
              d="m46 17-6 9 9 3-7 8"
              fill="none"
              stroke="#49392d"
              strokeWidth="2.5"
            />
            <path
              d="m25 28 3 3m44-16 3 3"
              stroke="#d8b48c"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}
        {status === "recovering" && (
          <>
            <path
              d="M48 36v-9m0 4-5-5m5 2 5-5M65 28v-7m0 3-4-4m4 2 4-4"
              stroke="#eff1d9"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
        {status === "under-restoration" && (
          <>
            <path
              d="M35 32v-13m30 13V19M35 21l15 10 15-10"
              fill="none"
              stroke="#f1e9d2"
              strokeWidth="2"
            />
            <path d="M50 32v-9" stroke="#9c6847" strokeWidth="2" />
          </>
        )}
        {status === "protected" && (
          <path
            d="m50 17 10 4v8q-3 8-10 11-7-3-10-11v-8z"
            fill="#dbe7c9"
            fillOpacity=".75"
            stroke="#f7f5de"
            strokeWidth="2"
          />
        )}
      </svg>
      <span className="parcel-status-icon">
        <StatusIcon status={status} />
      </span>
      {status === "degraded" && <BlightWisp size={16} />}
      {today && <span className="today-pin">TODAY</span>}
      {isMountain && <span className="parcel-lock">LOCKED</span>}
      {label && <span className="parcel-name">{label}</span>}
    </button>
  );
});
