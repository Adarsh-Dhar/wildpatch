import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion";

export type WildlifeName =
  | "Heron"
  | "Frog"
  | "Dragonfly"
  | "Deer"
  | "Fox"
  | "Bee"
  | "Otter"
  | "Salamander";
const colors: Record<WildlifeName, string> = {
  Heron: "#597f88",
  Frog: "#77985f",
  Dragonfly: "#5e92a3",
  Deer: "#a17b56",
  Fox: "#bd8054",
  Bee: "#d1a739",
  Otter: "#788892",
  Salamander: "#c27655",
};
export function WildlifeSprite({
  species,
  state = "discovered",
  size = 48,
  title,
}: {
  species: WildlifeName;
  state?: "discovered" | "silhouette";
  size?: number;
  title?: string;
}) {
  const reduceMotion = useReducedMotion();
  const discovered = state === "discovered";
  const body: Record<WildlifeName, ReactNode> = {
    Heron: (
      <>
        <path
          d="M50 18v48m0-27q-7-12-18-9"
          fill="none"
          stroke={discovered ? "#eef0df" : "#23301f"}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="m48 65-9 19m12-19 8 19"
          fill="none"
          stroke="#956d4b"
          strokeWidth="3"
        />
        <path d="m49 18 18 4-17 3" fill="#b8744a" />
      </>
    ),
    Frog: (
      <>
        <ellipse cx="50" cy="61" rx="26" ry="20" />
        <circle cx="35" cy="41" r="8" />
        <circle cx="64" cy="41" r="8" />
        <circle cx="35" cy="41" r="2" fill="#23301f" />
        <circle cx="64" cy="41" r="2" fill="#23301f" />
        <path
          d="M39 63q11 10 22 0"
          fill="none"
          stroke="#23301f"
          strokeWidth="3"
        />
      </>
    ),
    Dragonfly: (
      <>
        <path d="M49 30v50" stroke="#58747b" strokeWidth="4" />
        <ellipse cx="32" cy="43" rx="18" ry="8" fill="#a9cfcc" opacity=".8" />
        <ellipse cx="68" cy="43" rx="18" ry="8" fill="#a9cfcc" opacity=".8" />
        <ellipse cx="32" cy="57" rx="18" ry="8" fill="#a9cfcc" opacity=".65" />
        <ellipse cx="68" cy="57" rx="18" ry="8" fill="#a9cfcc" opacity=".65" />
        <circle cx="49" cy="27" r="6" />
      </>
    ),
    Deer: (
      <>
        <path
          d="M43 51v30m16-30v30m-16-21-11 14m27-14 11 14"
          stroke="#795b43"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <ellipse cx="51" cy="49" rx="18" ry="22" />
        <path
          d="m42 33-7-18m7 11-14-6m29 13 8-18m-8 11 14-6"
          fill="none"
          stroke="#795b43"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </>
    ),
    Fox: (
      <>
        <path d="M31 67 21 36l24 12q8-8 17 0l20-12-9 34-18 11z" />
        <path d="m39 67 12 13 14-13" fill="#f1e9d2" />
        <circle cx="42" cy="58" r="2" fill="#23301f" />
        <circle cx="60" cy="58" r="2" fill="#23301f" />
      </>
    ),
    Bee: (
      <>
        <ellipse cx="50" cy="56" rx="17" ry="22" />
        <path d="M42 37v38m16-38v38" stroke="#f2dfa1" strokeWidth="7" />
        <ellipse cx="36" cy="37" rx="15" ry="8" fill="#e8edf0" />
        <ellipse cx="64" cy="37" rx="15" ry="8" fill="#e8edf0" />
        <circle cx="46" cy="51" r="2" fill="#23301f" />
        <circle cx="55" cy="51" r="2" fill="#23301f" />
      </>
    ),
    Otter: (
      <>
        <ellipse cx="50" cy="58" rx="25" ry="17" />
        <circle cx="70" cy="50" r="12" />
        <path
          d="M27 60q-19 3-17 17 15 4 25-7"
          fill="none"
          stroke="#805f4f"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="74" cy="49" r="2" fill="#23301f" />
        <path d="M77 56h8" stroke="#23301f" strokeWidth="2" />
      </>
    ),
    Salamander: (
      <>
        <path
          d="M25 56q16-17 33 0 17 17 35 0"
          fill="none"
          stroke="#8b533e"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <circle cx="39" cy="49" r="3" />
        <circle cx="51" cy="48" r="3" />
        <path
          d="m37 60-8 11m30-11 10 11"
          stroke="#8b533e"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </>
    ),
  };
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={
        title ?? `${species}${discovered ? "" : ", not yet discovered"}`
      }
      animate={discovered && !reduceMotion ? { y: [0, -2, 0] } : undefined}
      transition={{ duration: 2.8, repeat: Infinity }}
    >
      {!discovered ? (
        <>
          <circle cx="50" cy="51" r="33" fill="#23301f" opacity=".22" />
          <text
            x="50"
            y="59"
            textAnchor="middle"
            fill="#23301f"
            opacity=".6"
            fontSize="27"
            fontFamily="Georgia"
          >
            ?
          </text>
        </>
      ) : (
        <g
          fill={colors[species]}
          stroke="#23301f"
          strokeOpacity=".3"
          strokeWidth="2"
          strokeLinejoin="round"
        >
          {body[species]}
        </g>
      )}
    </motion.svg>
  );
}
