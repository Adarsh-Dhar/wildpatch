import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion";

export function JudgeOak({
  mood = "approving",
  size = 112,
  title = "Judge Oak, wise field evaluator",
  animated = true,
}: {
  mood?: "approving" | "thoughtful" | "stern" | "reviewing";
  size?: number;
  title?: string;
  animated?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 130"
      role="img"
      aria-label={title}
      animate={animated && !reduceMotion ? { y: [0, -2, 0] } : undefined}
      transition={{ duration: 4, repeat: Infinity }}
    >
      <ellipse cx="60" cy="123" rx="35" ry="5" fill="#23301f" opacity=".12" />
      <path d="M52 68q1 24-5 53h27q-8-29-5-53" fill="#826c4d" />
      <path
        d="M50 85 34 99m38-15 17 10"
        stroke="#826c4d"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M26 72c-14-2-18-17-9-27-5-13 3-25 17-26 8-16 26-19 37-8 17-6 31 6 29 22 15 9 12 26-1 32-2 13-18 18-29 11-11 10-28 8-35-1-4 1-7 0-9-3Z"
        fill="#728958"
        stroke="#425739"
        strokeOpacity=".45"
        strokeWidth="2"
      />
      <circle
        cx="47"
        cy="50"
        r="11"
        fill="none"
        stroke="#514434"
        strokeWidth="2.5"
      />
      <circle
        cx="72"
        cy="50"
        r="11"
        fill="none"
        stroke="#514434"
        strokeWidth="2.5"
      />
      <path d="M58 49h3" stroke="#514434" strokeWidth="2.5" />
      <path
        d={
          mood === "stern"
            ? "M49 70q10-8 20 0"
            : mood === "thoughtful"
              ? "M50 68q9-3 18 1"
              : "M49 65q10 9 20 0"
        }
        fill="none"
        stroke="#433b2e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="m85 78 17-22m-7 0 8-1-1 8"
        fill="none"
        stroke="#826c4d"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {mood === "approving" && (
        <path d="m96 28 3 6 6 2-6 3-3 6-3-6-6-3 6-2z" fill="#e8b84a" />
      )}
      {mood === "reviewing" && (
        <path
          d="M83 65h19v23H83z"
          fill="#f1e9d2"
          stroke="#8a7958"
          strokeWidth="2"
        />
      )}
    </motion.svg>
  );
}
