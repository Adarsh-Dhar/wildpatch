"use client";

import { Compass, Heart, Map, TreePine } from "lucide-react";
import type { Tab } from "@/lib/types";
import { useGame } from "@/lib/engine/store";

const items: { name: Tab; icon: typeof Map }[] = [
  { name: "Map", icon: Map },
  { name: "Today", icon: Compass },
  { name: "Reserve", icon: TreePine },
  { name: "Profile", icon: Heart },
];
export function BottomTabs() {
  const { state, dispatch } = useGame();
  return (
    <nav className="bottom-tabs" aria-label="Main navigation">
      {items.map(({ name, icon: Icon }) => (
        <button
          key={name}
          type="button"
          onClick={() => dispatch({ type: "SET_TAB", tab: name })}
          className={state.tab === name ? "tab-active" : ""}
          aria-current={state.tab === name ? "page" : undefined}
        >
          <Icon aria-hidden="true" />
          <span>{name}</span>
          {name === "Today" && <i aria-hidden="true" />}
        </button>
      ))}
    </nav>
  );
}
