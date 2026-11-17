"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion";

export function StampSeal({
  children = "LOCKED",
  onClick,
}: {
  children?: string;
  onClick?: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      role="img"
      aria-label={children}
      className="stamp-seal"
      onClick={onClick}
      initial={reduced ? false : { scale: 1.6, opacity: 0, rotate: -12 }}
      animate={{ scale: 1, opacity: 1, rotate: -7 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
    >
      {children}
    </motion.span>
  );
}
