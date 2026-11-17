import { dailyScenario } from "./engine/scenario";
import {
  achievements,
  journalEntries,
  leaderboard,
  milestones,
  parcels,
  recentRestorations,
  specializations,
  species,
  stages,
} from "./data/mock-data";
import { causes, investigationTools } from "./engine/scenario";
import { restorationActions } from "./engine/actions";
import type { Confidence, Tab } from "./types";

const wait = (milliseconds: number) =>
  new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));
export async function getDailyScenario() {
  await wait(400);
  return dailyScenario;
}
export async function getLeaderboard(
  period: "daily" | "weekly" | "community" = "daily",
) {
  await wait(350);
  return leaderboard[period];
}
export async function getReserve() {
  await wait(350);
  return {
    points: 3842,
    target: 5000,
    progress: 80,
    contributors: 246,
    parcels,
  };
}
export async function getProfile() {
  await wait(300);
  return {
    name: "Fern Wilder",
    handle: "u/fern_wilder",
    title: "Restoration Specialist",
    level: 12,
    xp: 2840,
    xpNext: 3200,
    streak: 14,
    projects: 48,
    points: 3840,
  };
}
export async function getRecentRestorations() {
  await wait(400);
  return recentRestorations;
}
export const defaultConfidence: Confidence = "medium";
export const supportedTabs: Tab[] = ["Map", "Today", "Reserve", "Profile"];

export async function getInitialGameData() {
  const [scenario, daily, weekly, community, reserve, profile, feed] =
    await Promise.all([
      getDailyScenario(),
      getLeaderboard("daily"),
      getLeaderboard("weekly"),
      getLeaderboard("community"),
      getReserve(),
      getProfile(),
      getRecentRestorations(),
    ]);
  const { id, biome, difficulty, credits, investigationPoints, conditions } =
    scenario;
  return {
    scenario: {
      id,
      biome,
      difficulty,
      credits,
      investigationPoints,
      conditions,
    },
    causes,
    investigationTools,
    restorationActions,
    stages,
    leaderboard: { daily, weekly, community },
    reserve,
    profile,
    recentRestorations: feed,
    parcels,
    milestones,
    achievements,
    specializations,
    species,
    journalEntries,
  };
}
