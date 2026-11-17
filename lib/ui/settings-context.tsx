"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { GameSettings } from "@/lib/types";

type SettingsContextValue = {
  settings: GameSettings;
  updateSetting: <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K],
  ) => void;
  onboardingSeen: boolean;
  setOnboardingSeen: (value: boolean) => void;
};
const SettingsContext = createContext<SettingsContextValue | null>(null);
const defaultSettings: GameSettings = {
  soundOn: true,
  reducedMotion: false,
  colorblindMode: false,
  placementGrid: true,
  textSize: "normal",
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSettings((current) => ({
      ...current,
      reducedMotion: preference.matches,
    }));
    const handlePreference = (event: MediaQueryListEvent) =>
      setSettings((current) => ({ ...current, reducedMotion: event.matches }));
    preference.addEventListener("change", handlePreference);
    return () => preference.removeEventListener("change", handlePreference);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-reduced-motion", settings.reducedMotion);
    root.toggleAttribute("data-colorblind", settings.colorblindMode);
    root.dataset.textSize = settings.textSize;
  }, [settings]);
  const value = useMemo(
    () => ({
      settings,
      updateSetting: <K extends keyof GameSettings>(
        key: K,
        value: GameSettings[K],
      ) => setSettings((current) => ({ ...current, [key]: value })),
      onboardingSeen,
      setOnboardingSeen,
    }),
    [settings, onboardingSeen],
  );
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value)
    throw new Error("useSettings must be used inside SettingsProvider");
  return value;
}
