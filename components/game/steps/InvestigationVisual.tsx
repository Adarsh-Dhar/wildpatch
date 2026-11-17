"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ToolId } from "@/lib/types";
import { WildlifeSprite, type WildlifeName } from "../art/Wildlife";

const waterData = Array.from({ length: 12 }, (_, index) => ({
  week: `W${index + 1}`,
  actual: Math.max(28, 69 - index * 2.6),
  norm: 70 + Math.sin(index / 1.8) * 2,
}));
const rainfallData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
  (month, index) => ({
    month,
    rain: [62, 58, 76, 88, 94, 104][index],
    average: [64, 60, 78, 84, 91, 99][index],
  }),
);
const wildlife: { name: WildlifeName; seen: boolean; note: string }[] = [
  { name: "Heron", seen: true, note: "1 recent sighting" },
  { name: "Frog", seen: true, note: "2 of 7 expected calls" },
  { name: "Dragonfly", seen: true, note: "Present near shallow water" },
  { name: "Otter", seen: false, note: "No sign found" },
  { name: "Salamander", seen: false, note: "Not recorded this season" },
];
export function InvestigationVisual({ id }: { id: ToolId }) {
  const [slider, setSlider] = useState(54);
  if (id === "water")
    return (
      <div className="evidence-visual">
        <div className="chart-title">
          12-week water table <span>cm below seasonal norm</span>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={170}>
            <LineChart
              data={waterData}
              margin={{ top: 8, right: 12, bottom: 2, left: -16 }}
            >
              <CartesianGrid stroke="#dcd3bb" strokeDasharray="3 4" />
              <XAxis dataKey="week" tick={{ fontSize: 8 }} interval={2} />
              <YAxis tick={{ fontSize: 8 }} />
              <Tooltip />
              <ReferenceLine x="W5" stroke="#b8744a" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="norm"
                stroke="#7d9465"
                strokeDasharray="5 4"
                dot={false}
                name="Seasonal norm"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#4f8fa8"
                strokeWidth={2.5}
                dot={false}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <small>Gap begins at week 5 · nitrate is normal</small>
      </div>
    );
  if (id === "soil")
    return (
      <div className="evidence-visual soil-visual">
        <svg
          viewBox="0 0 180 110"
          role="img"
          aria-label="Soil moisture is 28 percent below baseline"
        >
          <path
            d="M25 90a65 65 0 0 1 130 0"
            fill="none"
            stroke="#ded6c4"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            d="M25 90a65 65 0 0 1 89-60"
            fill="none"
            stroke="#b8744a"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <text
            x="90"
            y="78"
            textAnchor="middle"
            fontSize="28"
            fill="#23301f"
            fontFamily="Georgia"
          >
            28%
          </text>
          <text x="90" y="98" textAnchor="middle" fontSize="9" fill="#747360">
            BELOW BASELINE
          </text>
        </svg>
        <small>Soil moisture · root zone</small>
      </div>
    );
  if (id === "vegetation")
    return (
      <div className="evidence-visual">
        <div className="chart-title">
          Ground cover <span>baseline native sedges · 72%</span>
        </div>
        <div
          className="vegetation-bar"
          role="img"
          aria-label="Native sedge 41 percent, invasive 4 percent, bare ground 55 percent"
        >
          <i style={{ width: "41%" }} />
          <i style={{ width: "4%" }} />
          <i style={{ width: "55%" }} />
          <b />
        </div>
        <div className="visual-legend">
          <span>
            Native <b>41%</b>
          </span>
          <span>
            Invasive <b>4%</b>
          </span>
          <span>
            Bare <b>55%</b>
          </span>
        </div>
      </div>
    );
  if (id === "wildlife")
    return (
      <div className="evidence-visual wildlife-list">
        {wildlife.map((item) => (
          <div key={item.name}>
            <WildlifeSprite
              species={item.name}
              state={item.seen ? "discovered" : "silhouette"}
              size={34}
            />
            <span>
              <strong>{item.name}</strong>
              <small>{item.note}</small>
            </span>
            <b aria-label={item.seen ? "Observed" : "Not observed"}>
              {item.seen ? "✓" : "—"}
            </b>
          </div>
        ))}
      </div>
    );
  if (id === "historical")
    return (
      <div className="evidence-visual historical-visual">
        <div className="map-compare">
          <div>
            <span>1984</span>
            <i className="old-waterway" />
          </div>
          <div>
            <span>NOW</span>
            <i className="new-ditch" />
          </div>
          <div className="compare-reveal" style={{ width: `${slider}%` }}>
            <span>1984</span>
            <i className="old-waterway" />
          </div>
          <input
            aria-label="Reveal the historical survey map"
            type="range"
            min="10"
            max="90"
            value={slider}
            onChange={(event) => setSlider(Number(event.target.value))}
          />
        </div>
        <small>A straight channel appeared between surveys.</small>
      </div>
    );
  if (id === "terrain")
    return (
      <div className="evidence-visual terrain-visual">
        <div className="terrain-map">
          <span className="contour contour-a" />
          <span className="contour contour-b" />
          <span className="contour contour-c" />
          <i className="channel-line" />
          <b>1.2 km · 0.8 m deep</b>
        </div>
        <small>Channel grade drains southeast.</small>
      </div>
    );
  if (id === "habitat")
    return (
      <div className="evidence-visual habitat-visual">
        <div className="habitat-bank">
          <span className="habitat-water" />
          <span className="habitat-edge old-edge" />
          <span className="habitat-edge new-edge" />
          <b>−18 m</b>
        </div>
        <small>Wetland edge receded 18 metres.</small>
      </div>
    );
  if (id === "records")
    return (
      <div className="evidence-visual">
        <div className="chart-title">
          Monthly rainfall <span>within 6% of average</span>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={rainfallData}
              margin={{ top: 8, right: 6, left: -20, bottom: 2 }}
            >
              <CartesianGrid stroke="#dcd3bb" strokeDasharray="3 4" />
              <XAxis dataKey="month" tick={{ fontSize: 8 }} />
              <YAxis tick={{ fontSize: 8 }} />
              <Tooltip />
              <Bar
                dataKey="average"
                fill="#a5ad83"
                radius={[4, 4, 0, 0]}
                name="Average"
              />
              <Bar
                dataKey="rain"
                fill="#4f8fa8"
                radius={[4, 4, 0, 0]}
                name="Recorded"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  return (
    <div className="quick-note">
      “Ground feels dry. Something straight cuts across the east side.”
      <small>— FIELD OBSERVATION</small>
    </div>
  );
}
