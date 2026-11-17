"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion";

export function Cloud({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={`world-cloud ${className}`}
      animate={reduced ? undefined : { x: [0, 16, 0] }}
      transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
export function BirdFlock() {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className="bird-flock"
      animate={reduced ? undefined : { x: ["-15vw", "120vw"] }}
      transition={{
        duration: 25,
        repeat: Infinity,
        repeatDelay: 8,
        ease: "linear",
      }}
    >
      ⌁　⌁　⌁
    </motion.span>
  );
}
export function SwayGrass() {
  const reduced = useReducedMotion();
  return (
    <span
      aria-hidden="true"
      className={`sway-grass ${reduced ? "motion-still" : ""}`}
    >
      ♧
    </span>
  );
}
