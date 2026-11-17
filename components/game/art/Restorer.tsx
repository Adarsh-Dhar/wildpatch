import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion";

const outfits = ["#6E9A5B", "#B8744A", "#4F8FA8", "#7A4E8C"];
export function Restorer({
  outfit = 0,
  mood = "idle",
  size = 92,
  className = "",
  title = "Fern Wilder, field restorer",
  animated = true,
}: {
  outfit?: 0 | 1 | 2 | 3;
  mood?: "idle" | "thinking" | "cheer";
  size?: number;
  className?: string;
  title?: string;
  animated?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 110"
      role="img"
      aria-label={title}
      animate={animated && !reduceMotion ? { y: [0, -2, 0] } : undefined}
      transition={{ duration: 3.5, repeat: Infinity }}
    >
      <ellipse cx="50" cy="103" rx="29" ry="5" fill="#23301f" opacity=".12" />
      <path d="M26 53q24-14 48 0l10 43H16z" fill={outfits[outfit]} />
      <path d="M38 55v24l12 8 12-8V55" fill="#f1e9d2" opacity=".9" />
      <path
        d="M31 35c0-17 9-27 20-27s20 10 20 27v10c0 14-9 24-20 24S31 59 31 45z"
        fill="#D8A77D"
        stroke="#23301f"
        strokeOpacity=".3"
        strokeWidth="2"
      />
      <path d="M22 35q2-24 29-24t29 24H22Z" fill="#536d47" />
      <path
        d="M15 35q36-10 72 0v7H15z"
        fill="#789461"
        stroke="#23301f"
        strokeOpacity=".25"
        strokeWidth="2"
      />
      <circle cx="43" cy="43" r="2" fill="#23301f" />
      <circle cx="59" cy="43" r="2" fill="#23301f" />
      <path
        d={
          mood === "cheer"
            ? "M44 53q7 8 14 0"
            : mood === "thinking"
              ? "M46 54q5-2 10 0"
              : "M45 53q6 5 12 0"
        }
        fill="none"
        stroke="#754c3c"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M70 58h17v24H70z"
        rx="3"
        fill="#e4d7b8"
        stroke="#79694c"
        strokeWidth="2"
      />
      <path
        d="M75 64h8m-8 5h8m-8 5h6"
        stroke="#8a7958"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}
