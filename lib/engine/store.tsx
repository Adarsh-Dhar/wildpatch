"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { actionCost, restorationActions } from "./actions";
import { investigationTools } from "./scenario";
import type {
  ActionId,
  CauseId,
  ComponentId,
  Confidence,
  Report,
  Severity,
  Stage,
  Submission,
  Tab,
  ToolId,
  FieldZone,
  PlacedPiece,
  EvidenceRelation,
} from "@/lib/types";
export type GameState = {
  tab: Tab;
  stage: Stage;
  investigationPoints: number;
  toolsUsed: ToolId[];
  toolPlacements: Partial<Record<ToolId, { x: number; y: number; zone: FieldZone; valid: boolean }>>;
  pinnedClues: ToolId[];
  clueRelations: Partial<Record<ToolId, Partial<Record<CauseId, EvidenceRelation>>>>;
  selectedZone: string | null;
  hintUsed: boolean;
  cause: CauseId | null;
  confidence: Confidence | null;
  components: ComponentId[];
  severity: Severity | null;
  diagnosisLocked: boolean;
  plan: PlacedPiece[];
  selectedPieceId: string | null;
  simulateProjection: boolean;
  pendingReport: Report | null;
  report: Report | null;
  lastReport: Report | null;
  unlockedSpecies: string[];
  earnedAchievements: string[];
  verifying: boolean;
  bestScore: number;
  communityPoints: number;
  projectsCompleted: number;
  biomesExplored: number;
  streak: number;
  restorationPoints: number;
  outfit: 0 | 1 | 2 | 3;
  celebration: number;
  toast: string;
};

type Action =
  | { type: "SET_TAB"; tab: Tab }
  | { type: "SET_STAGE"; stage: Stage }
  | { type: "VIEW_LAST_REPORT" }
  | { type: "USE_TOOL"; id: ToolId; zone?: FieldZone; x?: number; y?: number; valid?: boolean }
  | { type: "REMOVE_TOOL"; id: ToolId }
  | { type: "PIN_CLUE"; id: ToolId }
  | { type: "SET_CLUE_RELATION"; toolId: ToolId; cause: CauseId; relation: EvidenceRelation }
  | { type: "SET_ZONE"; zone: string | null }
  | { type: "USE_HINT" }
  | { type: "SET_CAUSE"; cause: CauseId }
  | { type: "SET_CONFIDENCE"; confidence: Confidence }
  | { type: "TOGGLE_COMPONENT"; component: ComponentId }
  | { type: "SET_SEVERITY"; severity: Severity }
  | { type: "LOCK_DIAGNOSIS" }
  | {
      type: "ADD_ACTION";
      id: ActionId;
      pieceId: string;
      zone?: FieldZone;
      x?: number;
      y?: number;
    }
  | { type: "DUPLICATE_PIECE"; id: string; pieceId: string }
  | { type: "ROTATE_PIECE"; id: string }
  | { type: "REMOVE_ACTION"; id: string }
  | { type: "MOVE_ACTION"; from: number; to: number }
  | { type: "MOVE_PIECE"; id: string; x: number; y: number; zone: FieldZone }
  | { type: "SELECT_PIECE"; id: string | null }
  | { type: "UPDATE_PIECE_SETTING"; id: string; key: "openness" | "density" | "width"; value: number }
  | { type: "SET_SIMULATE"; value: boolean }
  | { type: "SET_OUTFIT"; outfit: 0 | 1 | 2 | 3 }
  | { type: "CELEBRATE" }
  | { type: "START_VERIFICATION" }
  | { type: "RECEIVE_REPORT"; report: Report }
  | { type: "FAIL_VERIFICATION" }
  | { type: "SHOW_REPORT" }
  | { type: "TRY_ANOTHER_PLAN" }
  | { type: "SET_TOAST"; message: string };

const initialState: GameState = {
  tab: "Today",
  stage: "Briefing",
  investigationPoints: 12,
  toolsUsed: [],
  toolPlacements: {},
  pinnedClues: [],
  clueRelations: {},
  selectedZone: null,
  hintUsed: false,
  cause: null,
  confidence: null,
  components: [],
  severity: null,
  diagnosisLocked: false,
  plan: [],
  selectedPieceId: null,
  simulateProjection: false,
  pendingReport: null,
  report: null,
  lastReport: null,
  unlockedSpecies: [],
  earnedAchievements: [
    "first-restoration",
    "ten-ecosystems",
    "daily-streak",
    "three-biomes",
  ],
  verifying: false,
  bestScore: 0,
  communityPoints: 3842,
  projectsCompleted: 48,
  biomesExplored: 8,
  streak: 14,
  restorationPoints: 3840,
  outfit: 0,
  celebration: 0,
  toast: "",
};

const stageOrder: Stage[] = [
  "Briefing",
  "Investigate",
  "Diagnose",
  "Restore",
  "Report",
];
const pointCost = (id: ToolId) =>
  investigationTools.find((tool) => tool.id === id)?.cost ?? 0;

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, tab: action.tab };
    case "VIEW_LAST_REPORT":
      return state.lastReport
        ? { ...state, report: state.lastReport, stage: "Report" }
        : state;
    case "SET_STAGE": {
      const target = stageOrder.indexOf(action.stage);
      const current = stageOrder.indexOf(state.stage);
      if (target > current + 1) return state;
      if (action.stage === "Diagnose" && state.toolsUsed.length < 3)
        return state;
      if (action.stage === "Restore" && !state.diagnosisLocked) return state;
      if (action.stage === "Report" && !state.report) return state;
      return { ...state, stage: action.stage };
    }
    case "USE_TOOL": {
      if (state.toolsUsed.includes(action.id)) return state;
      const cost = pointCost(action.id);
      if (state.investigationPoints < cost)
        return { ...state, toast: "Not enough research points" };
      return {
        ...state,
        investigationPoints: state.investigationPoints - cost,
        toolsUsed: [...state.toolsUsed, action.id],
        toolPlacements: {
          ...state.toolPlacements,
          [action.id]: {
            zone: action.zone ?? "marsh",
            x: action.x ?? 50,
            y: action.y ?? 57,
            valid: action.valid ?? true,
          },
        },
        toast: "",
      };
    }
    case "REMOVE_TOOL": {
      if (!state.toolsUsed.includes(action.id)) return state;
      const cost = pointCost(action.id);
      return {
        ...state,
        investigationPoints: Math.min(12, state.investigationPoints + cost),
        toolsUsed: state.toolsUsed.filter((id) => id !== action.id),
        toolPlacements: { ...state.toolPlacements, [action.id]: undefined },
        clueRelations: { ...state.clueRelations, [action.id]: undefined },
        pinnedClues: state.pinnedClues.filter((id) => id !== action.id),
        toast:
          cost > 0
            ? `${cost} research ${cost === 1 ? "point" : "points"} refunded.`
            : "Quick observation removed from your notebook.",
      };
    }
    case "PIN_CLUE":
      return {
        ...state,
        pinnedClues: state.pinnedClues.includes(action.id)
          ? state.pinnedClues.filter((id) => id !== action.id)
          : [...state.pinnedClues, action.id],
      };
    case "SET_CLUE_RELATION":
      return {
        ...state,
        clueRelations: {
          ...state.clueRelations,
          [action.toolId]: {
            ...state.clueRelations[action.toolId],
            [action.cause]: action.relation,
          },
        },
      };
    case "SET_ZONE":
      return { ...state, selectedZone: action.zone };
    case "USE_HINT": {
      if (state.hintUsed || state.investigationPoints < 2)
        return {
          ...state,
          toast:
            state.investigationPoints < 2
              ? "You need 2 research points for a hint."
              : "The field note is already in your notebook.",
        };
      return {
        ...state,
        hintUsed: true,
        investigationPoints: state.investigationPoints - 2,
        toast:
          "Rainfall looks normal. What else could remove water from a marsh?",
      };
    }
    case "SET_CAUSE":
      return state.diagnosisLocked ? state : { ...state, cause: action.cause };
    case "SET_CONFIDENCE":
      return state.diagnosisLocked
        ? state
        : { ...state, confidence: action.confidence };
    case "TOGGLE_COMPONENT":
      return state.diagnosisLocked
        ? state
        : {
            ...state,
            components: state.components.includes(action.component)
              ? state.components.filter((item) => item !== action.component)
              : [...state.components, action.component],
          };
    case "SET_SEVERITY":
      return state.diagnosisLocked
        ? state
        : { ...state, severity: action.severity };
    case "LOCK_DIAGNOSIS":
      if (
        !state.cause ||
        !state.confidence ||
        !state.components.length ||
        !state.severity
      )
        return {
          ...state,
          toast:
            "Choose a cause, confidence, at least one component, and severity.",
        };
      return {
        ...state,
        diagnosisLocked: true,
        stage: "Restore",
        toast: "Diagnosis locked. Build your plan.",
      };
    case "ADD_ACTION": {
      const item = restorationActions.find(
        (candidate) => candidate.id === action.id,
      );
      if (!item) return state;
      const index = state.plan.length;
      const defaultZones: Record<ActionId, FieldZone> = {
        "block-ditch": "ditch",
        "restore-flow": "stream",
        "plant-sedges": "marsh",
        "monitor-water": "marsh",
        "bank-control": "bank",
        "remove-invasives": "marsh",
        "fish-stocking": "stream",
        fertilizer: "upland",
        "wind-pump": "upland",
        "habitat-corridor": "bank",
      };
      const piece: PlacedPiece = {
        id: action.pieceId,
        actionId: action.id,
        rotation: 0,
        zone: action.zone ?? defaultZones[action.id],
        x: action.x ?? [27, 68, 50, 77, 23][index % 5],
        y: action.y ?? [34, 30, 57, 70, 75][index % 5],
        order: index + 1,
        settings:
          action.id === "block-ditch"
            ? { openness: 20 }
            : action.id === "plant-sedges"
              ? { density: 3 }
              : action.id === "restore-flow"
                ? { width: 2 }
                : {},
      };
      return {
        ...state,
        plan: [...state.plan, piece],
        selectedPieceId: piece.id,
        toast: item.warning ?? "",
      };
    }
    case "DUPLICATE_PIECE": {
      const original = state.plan.find((piece) => piece.id === action.id);
      if (!original || state.plan.length >= 20) return state;
      const duplicate: PlacedPiece = {
        ...original,
        id: action.pieceId,
        x: Math.max(4, Math.min(96, original.x + (original.x > 90 ? -3 : 3))),
        y: Math.max(8, Math.min(92, original.y + (original.y > 86 ? -4 : 4))),
        order: state.plan.length + 1,
        settings: { ...original.settings },
      };
      return {
        ...state,
        plan: [...state.plan, duplicate],
        selectedPieceId: duplicate.id,
        toast: "Piece duplicated. Drag it to a new position.",
      };
    }
    case "ROTATE_PIECE":
      return {
        ...state,
        plan: state.plan.map((piece) =>
          piece.id === action.id
            ? { ...piece, rotation: ((piece.rotation ?? 0) + 90) % 360 }
            : piece,
        ),
      };
    case "REMOVE_ACTION": {
      const plan = state.plan
        .filter((piece) => piece.id !== action.id)
        .map((piece, index) => ({ ...piece, order: index + 1 }));
      return {
        ...state,
        plan,
        selectedPieceId:
          state.selectedPieceId &&
          plan.some((piece) => piece.id === state.selectedPieceId)
            ? state.selectedPieceId
            : null,
      };
    }
    case "MOVE_ACTION": {
      if (
        action.from < 0 ||
        action.from >= state.plan.length ||
        action.to < 0 ||
        action.to >= state.plan.length
      )
        return state;
      const plan = [...state.plan];
      const [item] = plan.splice(action.from, 1);
      plan.splice(action.to, 0, item);
      return { ...state, plan: plan.map((piece, index) => ({ ...piece, order: index + 1 })) };
    }
    case "MOVE_PIECE":
      return {
        ...state,
        plan: state.plan.map((piece) =>
          piece.id === action.id
            ? { ...piece, x: action.x, y: action.y, zone: action.zone }
            : piece,
        ),
      };
    case "SELECT_PIECE":
      return { ...state, selectedPieceId: action.id };
    case "SET_SIMULATE":
      return { ...state, simulateProjection: action.value };
    case "UPDATE_PIECE_SETTING":
      return {
        ...state,
        plan: state.plan.map((piece) =>
          piece.id === action.id
            ? {
                ...piece,
                settings: { ...piece.settings, [action.key]: action.value },
              }
            : piece,
        ),
      };
    case "SET_OUTFIT":
      return { ...state, outfit: action.outfit };
    case "CELEBRATE":
      return { ...state, celebration: state.celebration + 1 };
    case "START_VERIFICATION":
      return !state.diagnosisLocked || !state.plan.length || state.verifying
        ? state
        : { ...state, pendingReport: null, verifying: true, toast: "" };
    case "RECEIVE_REPORT":
      return !state.verifying
        ? state
        : { ...state, pendingReport: action.report };
    case "FAIL_VERIFICATION":
      return {
        ...state,
        pendingReport: null,
        verifying: false,
        toast: "The field report could not be prepared. Try again.",
      };
    case "SHOW_REPORT": {
      if (!state.pendingReport) return state;
      const report = state.pendingReport;
      return {
        ...state,
        report,
        lastReport: report,
        unlockedSpecies: [
          ...new Set([...state.unlockedSpecies, ...report.returnedWildlife]),
        ],
        earnedAchievements: [
          ...new Set([
            ...state.earnedAchievements,
            ...report.unlockedAchievements.map((name) =>
              name.toLowerCase().replaceAll(" ", "-"),
            ),
          ]),
        ],
        pendingReport: null,
        verifying: false,
        stage: "Report",
        bestScore: Math.max(state.bestScore, report.total),
        communityPoints: state.communityPoints + report.rewards.communityPoints,
        projectsCompleted: state.projectsCompleted + (state.lastReport ? 0 : 1),
        biomesExplored: state.biomesExplored + (state.lastReport ? 0 : 1),
        streak: state.lastReport ? state.streak : state.streak + 1,
        restorationPoints:
          state.restorationPoints + report.rewards.restorationPoints,
        toast:
          report.total > state.bestScore
            ? "New best!"
            : "Your field report is ready.",
      };
    }
    case "TRY_ANOTHER_PLAN":
      return state.diagnosisLocked
        ? {
            ...state,
            stage: "Restore",
            plan: [],
            selectedPieceId: null,
            report: null,
            pendingReport: null,
            verifying: false,
            toast:
              "Your diagnosis is locked. Try a different restoration plan.",
          }
        : state;
    case "SET_TOAST":
      return { ...state, toast: action.message };
  }
}

export function buildSubmission(state: GameState): Submission | null {
  if (
    !state.cause ||
    !state.confidence ||
    !state.severity ||
    !state.diagnosisLocked ||
    !state.plan.length
  )
    return null;
  return {
    cause: state.cause,
    confidence: state.confidence,
    components: state.components,
    severity: state.severity,
    plan: state.plan,
    toolsUsed: state.toolsUsed,
    creditsSpent: state.plan.reduce((sum, piece) => sum + actionCost(piece), 0),
    researchPointsRemaining: state.investigationPoints,
  };
}

type GameContextValue = { state: GameState; dispatch: React.Dispatch<Action> };
const GameContext = createContext<GameContextValue | null>(null);
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
export function useGame() {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame must be used inside GameProvider");
  return value;
}
