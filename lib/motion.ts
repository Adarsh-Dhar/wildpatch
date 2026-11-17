"use client";

import { useReducedMotion as useFramerReducedMotion } from "framer-motion";
import { useSettings } from "./ui/settings-context";

export const spring = {
  card: { type: "spring" as const, stiffness: 260, damping: 24 },
  pop: { type: "spring" as const, stiffness: 420, damping: 18 },
  gentle: { type: "spring" as const, stiffness: 120, damping: 20 },
};
export const duration = { fast: 0.15, base: 0.3, slow: 0.6, countUp: 0.9 };
export const progressEase = [0.22, 1, 0.36, 1] as const;
export function useReducedMotion() {
  const systemPreference = useFramerReducedMotion();
  const { settings } = useSettings();
  return Boolean(systemPreference || settings.reducedMotion);
}
