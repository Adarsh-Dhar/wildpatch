import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion";

export type BlightMood = "idle" | "scheming" | "defeated" | "sneaky";
export function Blight({
  mood = "idle",
  size = 84,
  className = "",
  title = "Blight, a playful storm-cloud spirit",
  animated = true,
}: {
  mood?: BlightMood;
  size?: number;
  className?: string;
  title?: string;
  animated?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animated && !reduceMotion;
  const defeatedAnimation = shouldAnimate && mood === "defeated";
  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      animate={
        defeatedAnimation
          ? { scale: [1, 0.85, 0.2], opacity: [1, 0.85, 0], y: [0, 8, 24] }
          : shouldAnimate
            ? { y: [0, -4, 0], rotate: mood === "sneaky" ? [-3, 2, -3] : 0 }
            : { y: 0, rotate: 0 }
      }
      transition={{
        duration: defeatedAnimation ? 1.1 : 3,
        repeat: shouldAnimate && !defeatedAnimation ? Infinity : 0,
        ease: "easeInOut",
      }}
    >
      <defs>
        <radialGradient id="blightGlow">
          <stop stopColor="#b898c6" stopOpacity=".48" />
          <stop offset="1" stopColor="#7A4E8C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="51" cy="84" rx="32" ry="8" fill="#34283d" opacity=".16" />
      <circle cx="50" cy="49" r="43" fill="url(#blightGlow)" />
      <path
        d="M17 66c-9-2-12-8-9-15 2-5 7-8 13-8-2-10 5-18 16-17 5-11 20-13 28-4 12-5 24 3 23 15 9 4 12 12 8 20-3 6-9 9-18 8H24c-2 0-5 0-7-1Z"
        fill="#8a7093"
        stroke="#4f4058"
        strokeOpacity=".45"
        strokeWidth="2"
      />
      {mood === "sneaky" ? (
        <path
          d="M39 48c4-5 9-5 13 0m10 0c4-5 9-5 13 0"
          fill="none"
          stroke="#342d3d"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : (
        <>
          <ellipse cx="42" cy="49" rx="3" ry="5" fill="#342d3d" />
          <ellipse cx="65" cy="49" rx="3" ry="5" fill="#342d3d" />
        </>
      )}
      <path
        d={mood === "defeated" ? "M47 66q7-5 14 0" : "M47 61q7 7 14 0"}
        fill="none"
        stroke="#49354c"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="m25 72-6 12 10-2m46-8 6 12-10-2"
        fill="none"
        stroke="#7A4E8C"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {mood === "scheming" && (
        <path
          d="m30 80-3 7m48-8 3 7"
          stroke="#7a9ab0"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </motion.svg>
  );
}
export function BlightWisp({ size = 28 }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      aria-label="A mischievous field wisp"
      role="img"
      className="blight-wisp-art"
      animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
      transition={{ duration: 2.8, repeat: Infinity }}
      style={{ width: size, height: size }}
    >
      ✦
    </motion.span>
  );
}
