"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { getInitialGameData } from "@/lib/api";

export type GameData = Awaited<ReturnType<typeof getInitialGameData>>;
const GameDataContext = createContext<GameData | null>(null);
export function GameDataProvider({
  data,
  children,
}: {
  data: GameData;
  children: ReactNode;
}) {
  return (
    <GameDataContext.Provider value={data}>{children}</GameDataContext.Provider>
  );
}
export function useGameData() {
  const value = useContext(GameDataContext);
  if (!value)
    throw new Error("useGameData must be used inside GameDataProvider");
  return value;
}
