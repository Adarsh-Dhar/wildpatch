"use client";

import { useEffect, useMemo, useState } from "react";
import { Flower2, LockKeyhole, Sprout, TreePine, Waves } from "lucide-react";
import { useGame } from "@/lib/engine/store";
import { useGameData } from "@/lib/data/context";
import { useSettings } from "@/lib/ui/settings-context";
import { WildlifeSprite, type WildlifeName } from "../art/Wildlife";
import { Restorer } from "../art/Restorer";
import { BirdFlock, SwayGrass } from "../art/WorldOrnaments";
import { BottomSheet, SegmentedControl } from "../ui-kit";

type Period = "daily" | "weekly" | "community";
const speciesNames: Record<string, WildlifeName> = {
  Heron: "Heron",
  Frog: "Frog",
  Dragonfly: "Dragonfly",
  Otter: "Otter",
  Bee: "Bee",
  Salamander: "Salamander",
};

export function Reserve() {
  const { state } = useGame();
  const { settings } = useSettings();
  const data = useGameData();
  const milestones = data.milestones;
  const [period, setPeriod] = useState<Period>("daily");
  const [milestoneOpen, setMilestoneOpen] = useState<number | null>(null);
  const [feed, setFeed] = useState(data.recentRestorations);
  const [debugStage, setDebugStage] = useState<number | null>(null);
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" ||
      window.location.search !== "?debug=1"
    )
      return;
    setDebugStage(2);
  }, []);
  useEffect(() => {
    if (settings.reducedMotion || document.visibilityState !== "visible")
      return;
    let next = 0;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const entry =
        data.recentRestorations[next % data.recentRestorations.length];
      next += 1;
      setFeed((current) =>
        [{ ...entry, time: "just now" }, ...current].slice(0, 8),
      );
    }, 12000);
    return () => window.clearInterval(id);
  }, [data.recentRestorations, settings.reducedMotion]);
  const points = state.communityPoints;
  const growthStage =
    debugStage ??
    (points >= 5000 ? 3 : points >= 2500 ? 2 : points >= 1000 ? 1 : 0);
  const stageNames = ["Bare land", "Saplings", "Meadow", "Full habitat"];
  const stageThresholds = [1000, 2500, 5000];
  const nextGoal = growthStage === 3 ? 5000 : stageThresholds[growthStage];
  const progress =
    growthStage === 3
      ? 100
      : Math.min(
          100,
          ((points -
            (growthStage === 0 ? 0 : stageThresholds[growthStage - 1])) /
            (nextGoal -
              (growthStage === 0 ? 0 : stageThresholds[growthStage - 1]))) *
            100,
        );
  const selectedLeaderboard = useMemo(() => {
    const rows = data.leaderboard[period].map((item) =>
      item.name === "you"
        ? {
            ...item,
            score:
              period === "daily"
                ? state.bestScore
                : period === "weekly"
                  ? state.restorationPoints
                  : Math.max(0, state.communityPoints - data.reserve.points),
            flair: "Restoration Specialist",
          }
        : item,
    );
    return [...rows].sort((first, second) => second.score - first.score);
  }, [
    data.leaderboard,
    data.reserve.points,
    period,
    state.bestScore,
    state.communityPoints,
    state.restorationPoints,
  ]);
  return (
    <>
      <div className="section-heading">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> R/WILDPATCHPLAYERS
        </div>
        <h1>
          We grow <em>together.</em>
        </h1>
        <p>
          Every restoration adds a little more life to our shared community
          reserve.
        </p>
      </div>
      <section
        className={`reserve-scene reserve-stage-${growthStage}`}
        aria-label={`Community reserve: ${stageNames[growthStage]}`}
      >
        <div className="reserve-sun" />
        <div className="reserve-hills" />
        <div className="reserve-water" />
        <div className="reserve-trees">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        {growthStage >= 1 && (
          <div className="reserve-saplings">
            <i />
            <i />
            <i />
          </div>
        )}
        {growthStage >= 2 && <SwayGrass />}
        {growthStage >= 3 && (
          <div className="reserve-wildlife">
            <WildlifeSprite species="Heron" size={48} />
            <WildlifeSprite species="Otter" size={42} />
          </div>
        )}
        {growthStage >= 1 && !settings.reducedMotion && <BirdFlock />}
        <div className="reserve-sign">
          THE COMMONS
          <br />
          <small>
            COMMUNITY RESERVE · {stageNames[growthStage].toUpperCase()}
          </small>
        </div>
        <div className="reserve-counter">
          <Sprout aria-hidden="true" /> {points.toLocaleString()}{" "}
          <small>community points</small>
        </div>
      </section>
      <section className="goal-card">
        <div className="goal-title">
          <div>
            <span className="eyebrow">THIS WEEK&apos;S SHARED GOAL</span>
            <h2>Restore 120 wetland parcels.</h2>
          </div>
          <span className="goal-mark">
            <Waves aria-hidden="true" />
          </span>
        </div>
        <p>
          {data.reserve.progress + Math.max(0, points - data.reserve.points)} of
          120 restorations · {data.reserve.contributors} neighbors pitching in
        </p>
        <div className="goal-track">
          <i
            style={{
              width: `${Math.min(100, ((data.reserve.progress + Math.max(0, points - data.reserve.points)) / 120) * 100)}%`,
            }}
          />
        </div>
        <div className="goal-foot">
          <strong>
            Next stage: {stageNames[Math.min(3, growthStage + 1)]}
          </strong>
          <span>
            {Math.max(0, nextGoal - points)} points to go · 2d 14h left
          </span>
        </div>
        <div className="reserve-progress">
          <b>{points.toLocaleString()}</b>
          <span> · {Math.round(progress)}% to the next habitat stage</span>
        </div>
      </section>
      {debugStage !== null && (
        <label className="debug-stage">
          Preview habitat stage{" "}
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={debugStage}
            onChange={(event) => setDebugStage(Number(event.target.value))}
          />
        </label>
      )}
      <section className="milestone-track">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">THE RESERVE GROWS</span>
            <h2>Community milestones</h2>
          </div>
          <span className="tool-count">
            {
              milestones.filter(
                (item) => state.projectsCompleted >= item.target,
              ).length
            }{" "}
            / {milestones.length}
          </span>
        </div>
        <div className="milestone-scroll">
          {milestones.map((item, index) => {
            const done = state.projectsCompleted >= item.target;
            const Icon = index === 0 ? Waves : index === 1 ? Flower2 : TreePine;
            return (
              <button
                className={`milestone ${done ? "milestone-done" : ""}`}
                key={item.target}
                onClick={() => setMilestoneOpen(index)}
              >
                <span className="milestone-node">
                  {done ? (
                    <Icon aria-hidden="true" />
                  ) : (
                    <LockKeyhole aria-hidden="true" />
                  )}
                </span>
                <strong>
                  {item.target} {item.label}
                </strong>
                <small>{item.title}</small>
                <i>
                  {done
                    ? "UNLOCKED"
                    : `${Math.max(0, item.target - points)} TO GO`}
                </i>
              </button>
            );
          })}
        </div>
      </section>
      <section className="leaderboard">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">YOUR NEIGHBORS</span>
            <h2>Field leaderboard</h2>
          </div>
          <span className="leader-period">THIS WEEK</span>
        </div>
        <SegmentedControl
          value={period}
          options={["daily", "weekly", "community"] as const}
          ariaLabel="Leaderboard period"
          onChange={setPeriod}
        />
        <ol className="leaderboard-list">
          {selectedLeaderboard.map((row, index) => (
            <li
              key={`${period}-${row.name}`}
              className={row.name === "you" ? "your-leader-row" : ""}
            >
              <span className={`rank-medal medal-${index + 1}`}>
                {index < 3 ? ["GOLD", "SILVER", "BRONZE"][index] : index + 1}
              </span>
              <span className="leader-avatar">
                <span>
                  {row.name === "you" ? (
                    <Restorer outfit={state.outfit} size={38} />
                  ) : (
                    <WildlifeSprite
                      species={
                        ["Heron", "Fox", "Otter", "Bee", "Deer"][
                          index % 5
                        ] as WildlifeName
                      }
                      state="discovered"
                      size={34}
                    />
                  )}
                </span>
              </span>
              <span className="leader-name">
                <strong>
                  {row.name === "you" ? "u/fern_wilder" : `u/${row.name}`}
                </strong>
                <small>{row.flair}</small>
              </span>
              <b>{row.score}</b>
            </li>
          ))}
        </ol>
        <div className="your-rank-row">
          <span>YOUR RANK</span>
          <strong>
            {state.bestScore
              ? `#${Math.max(1, 12 - Math.floor(state.bestScore / 10))}`
              : "—"}
          </strong>
          <span>{state.bestScore} pts · Fern Wilder</span>
        </div>
      </section>
      <section className="recent-feed">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">FIELD NOTES FROM THE COMMUNITY</span>
            <h2>Recent restorations</h2>
          </div>
          <span className="live-feed">
            <i /> LIVE
          </span>
        </div>
        <div className="recent-list">
          {feed.map((entry, index) => (
            <article
              key={`${entry.player}-${entry.parcel}-${index}`}
              className="recent-entry"
            >
              <span className="recent-wildlife">
                <WildlifeSprite
                  species={speciesNames[entry.species] ?? "Heron"}
                  size={34}
                />
              </span>
              <span>
                <strong>{entry.player}</strong>
                <small>restored {entry.parcel}</small>
              </span>
              <time>{entry.time}</time>
            </article>
          ))}
        </div>
      </section>
      <BottomSheet
        open={milestoneOpen !== null}
        onClose={() => setMilestoneOpen(null)}
        title={
          milestoneOpen === null
            ? "Reserve milestone"
            : milestones[milestoneOpen].title
        }
      >
        {milestoneOpen !== null && (
          <>
            <p>{milestones[milestoneOpen].detail}</p>
            <p className="milestone-progress-note">
              {points >= milestones[milestoneOpen].target
                ? "This community milestone is unlocked."
                : `${milestones[milestoneOpen].target - state.projectsCompleted} restorations to go.`}
            </p>
          </>
        )}
      </BottomSheet>
    </>
  );
}
