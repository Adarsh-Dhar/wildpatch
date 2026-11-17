"use client";

import { Coins, Flame, Leaf, Menu, Search, Sprout } from "lucide-react";
import { useGame } from "@/lib/engine/store";
import { restorationActions } from "@/lib/engine/actions";
import { Restorer } from "./art/Restorer";

export function TopBar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { state, dispatch } = useGame();
  const spent = state.plan.reduce(
    (sum, id) =>
      sum + (restorationActions.find((item) => item.id === id)?.cost ?? 0),
    0,
  );
  return (
    <header className="topbar game-topbar">
      <button
        className="brand-mark"
        type="button"
        onClick={() => {
          dispatch({ type: "SET_TAB", tab: "Today" });
          dispatch({ type: "SET_STAGE", stage: "Briefing" });
        }}
        aria-label="Wildpatch home"
      >
        <span className="brand-icon">
          <Sprout aria-hidden="true" />
        </span>
        <span>
          <strong>wildpatch</strong>
          <small>FIELD JOURNAL · DAY 01</small>
        </span>
      </button>
      <div className="hud" aria-label="Player progress">
        <span className="hud-level">
          <Leaf aria-hidden="true" /> LVL 12
        </span>
        <span className="hud-credit">
          <Coins aria-hidden="true" /> {Math.max(0, 100 - spent)}
        </span>
        <span className="hud-studies">
          <Search aria-hidden="true" /> {state.investigationPoints}
        </span>
        <span className="hud-streak">
          <Flame aria-hidden="true" /> {state.streak}
        </span>
      </div>
      <span className="hud-restorer" title="Fern Wilder">
        <Restorer outfit={state.outfit} size={38} />
      </span>
      <button
        className="menu-button"
        aria-label="Open settings"
        onClick={onOpenSettings}
      >
        <Menu aria-hidden="true" />
      </button>
    </header>
  );
}
