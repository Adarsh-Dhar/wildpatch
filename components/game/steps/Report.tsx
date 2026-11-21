"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clipboard,
  Sparkles,
  X,
} from "lucide-react";
import { useGame } from "@/lib/engine/store";
import { useGameData } from "@/lib/data/context";
import { assetUrl } from "@/lib/config";
import { Blight } from "../art/Blight";
import { JudgeOak } from "../art/JudgeOak";
import { WildlifeSprite, type WildlifeName } from "../art/Wildlife";
import {
  BottomSheet,
  ChunkyButton,
  ConditionMeter,
  LeafBurst,
  ScoreRing,
  StageStepper,
} from "../ui-kit";
import { ScoringSheet } from "../ScoringSheet";

const maxScores = [20, 30, 20, 15, 15] as const;
const labels = [
  "Diagnosis",
  "Intervention",
  "Execution",
  "Efficiency",
  "Recovery",
] as const;
export function Report() {
  const { state, dispatch } = useGame();
  const data = useGameData();
  const [scoringOpen, setScoringOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [slider, setSlider] = useState(50);
  const [copied, setCopied] = useState(false);
  const report = state.report;
  const scores = report
    ? [
        report.breakdown.diagnosis,
        report.breakdown.intervention,
        report.breakdown.execution,
        report.breakdown.efficiency,
        report.breakdown.recovery,
      ]
    : [0, 0, 0, 0, 0];
  const shareGrid = scores
    .map((score, index) =>
      score / maxScores[index] >= 0.8
        ? "🟩"
        : score / maxScores[index] >= 0.5
          ? "🟨"
          : "🟥",
    )
    .join("");
  const shareText = report
    ? `WILDPATCH ${data.scenario.siteName} · ${data.scenario.challengeDate ?? "Daily"} · ${report.total}/100\n${shareGrid} · ${data.scenario.biome} · Streak ${state.streak}`
    : "";
  if (!report)
    return (
      <div className="empty-report">
        <JudgeOak mood="reviewing" />
        <h1>Your field report is still in the notebook.</h1>
        <p>Complete a restoration plan and submit it for verification.</p>
        <ChunkyButton
          onClick={() => dispatch({ type: "SET_STAGE", stage: "Restore" })}
        >
          Return to your plan
        </ChunkyButton>
      </div>
    );
  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      const field = document.createElement("textarea");
      field.value = shareText;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    dispatch({ type: "CELEBRATE" });
    window.setTimeout(() => setCopied(false), 2200);
  };
  const speciesNames = new Map<string, WildlifeName>([
    ["Heron", "Heron"],
    ["Frog chorus", "Frog"],
    ["Dragonfly", "Dragonfly"],
  ]);
  const mood = report.verdictMood;
  return (
    <>
      <div className="report-hero">
        <JudgeOak mood={mood} />
        <div>
          <span className="eyebrow">JUDGE OAK HAS REVIEWED YOUR PLAN</span>
          <h1>
            {mood === "approving"
              ? "A strong plan."
              : mood === "thoughtful"
                ? "A fair start."
                : "A field lesson."}
            <br />
            <em>
              {mood === "approving"
                ? "The wetland is responding."
                : mood === "thoughtful"
                  ? "Some choices need rethinking."
                  : "Keep learning from the land."}
            </em>
          </h1>
          <p>
            {mood === "approving"
              ? `A thoughtful plan gives ${data.scenario.siteName} room to recover.`
              : mood === "thoughtful"
                ? "You made a start. The evidence can guide your next plan."
                : "This plan needs another look at the field evidence."}
          </p>
        </div>
      </div>
      <section className="score-card">
        <ScoreRing score={report.total} />
        <div className="score-message">
          <span className="score-badge">
            <Sparkles aria-hidden="true" />{" "}
            {mood === "approving"
              ? "FIELD EXCELLENT"
              : mood === "thoughtful"
                ? "GOOD FIRST STEPS"
                : "MORE TO LEARN"}
          </span>
          <h2>
            {report.total} <small>OUT OF 100</small>
          </h2>
          <p>
            Recovery takes time. Full recovery unlocks over the coming days.
          </p>
        </div>
      </section>
      <section className="score-breakdown">
        <div className="card-topline">
          <span>YOUR SCORE, BY THE NUMBERS</span>
          <button
            aria-label="How scoring works"
            onClick={() => setScoringOpen(true)}
          >
            ?
          </button>
        </div>
        {labels.map((label, index) => (
          <div className="score-row" key={label}>
            <div>
              <span>{label}</span>
              <b>
                {scores[index]}
                <small> / {maxScores[index]}</small>
              </b>
            </div>
            <div className="score-track">
              <i
                style={{
                  width: `${(scores[index] / maxScores[index]) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </section>
      <section className="verdict-notes">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">VERIFIER&apos;S NOTES</span>
            <h2>What happened</h2>
          </div>
          <BadgeCheck aria-label="Verification complete" />
        </div>
        {(["pass", "warn", "fail"] as const).map((kind) => {
          const notes = report.notes.filter((note) => note.kind === kind);
          if (!notes.length) return null;
          const label =
            kind === "pass" ? "Pass" : kind === "warn" ? "Warnings" : "Issues";
          return (
            <details
              key={kind}
              open={kind === "pass"}
              className={`notes-group notes-${kind}`}
            >
              <summary>
                {kind === "pass" ? "✓" : kind === "warn" ? "⚠" : "✕"} {label} ·{" "}
                {notes.length}
              </summary>
              {notes.map((note) => (
                <p key={note.text}>
                  {note.kind === "pass" ? (
                    <Check aria-hidden="true" />
                  ) : (
                    <X aria-hidden="true" />
                  )}
                  {note.text}
                </p>
              ))}
            </details>
          );
        })}
      </section>
      <section className="before-after">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">A LIVING LANDSCAPE</span>
            <h2>Recovery takes time.</h2>
          </div>
          <span className="early-recovery">
            {report.recoveryStage.toUpperCase()}
          </span>
        </div>
        <div className="compare-slider">
          <div className="compare-base">
            <img
              src={assetUrl("wetland-dry.webp")}
              alt={`${data.scenario.siteName} before restoration`}
            />
          </div>
          <div
            className="compare-overlay"
            style={{
              clipPath: `inset(0 ${100 - slider}% 0 0)`,
              opacity: 0.35 + (report.total / 100) * 0.65,
            }}
          >
            <img
              src={assetUrl("wetland-recovering.webp")}
              alt={`${data.scenario.siteName} projected recovery`}
            />
          </div>
          <input
            type="range"
            aria-label="Compare before and after"
            min="0"
            max="100"
            value={slider}
            onChange={(event) => setSlider(Number(event.target.value))}
          />
          <span className="compare-divider" style={{ left: `${slider}%` }} />
          <span className="compare-label before-label">BEFORE</span>
          <span className="compare-label after-label">AFTER</span>
        </div>
        <div className="recovery-meters">
          {(
            [
              "water",
              "soil",
              "waterQuality",
              "vegetation",
              "biodiversity",
            ] as const
          ).map((key) => (
            <ConditionMeter
              key={key}
              label={
                key === "waterQuality"
                  ? "Water quality"
                  : key[0].toUpperCase() + key.slice(1)
              }
              from={35}
              value={report.finalConditions[key]}
              delta={
                report.finalConditions[key] -
                {
                  water: 35,
                  soil: 55,
                  waterQuality: 70,
                  vegetation: 48,
                  biodiversity: 52,
                }[key]
              }
            />
          ))}
        </div>
        <StageStepper stage={report.recoveryStage} />
        <small className="recovery-note">
          Recovery takes time. Full recovery unlocks over the coming days.
        </small>
      </section>
      <section className="judge-reaction">
        <Blight mood={report.total >= 80 ? "defeated" : "scheming"} size={64} />
        <p>
          {report.total >= 80
            ? "Blight drifts away as the wetland finds room to recover."
            : "Blight peeks through the reeds: “Not so fast…”"}
        </p>
      </section>
      <section className="reward-card">
        <span className="reward-spark">
          <Sparkles aria-hidden="true" />
        </span>
        <div>
          <span className="eyebrow">FIELDWORK REWARDS</span>
          <div className="reward-pills">
            <b>+{report.rewards.xp} XP</b>
            <b>+{report.rewards.restorationPoints} points</b>
            <b>+{report.rewards.researchPoints} research</b>
            <b>+{report.rewards.communityPoints} community</b>
          </div>
          {state.bestScore > report.total && <p>Best: {state.bestScore}</p>}
        </div>
      </section>
      {report.unlockedAchievements.length > 0 && (
        <section className="achievement-unlocked">
          <h2>New field badges</h2>
          <div>
            {report.unlockedAchievements.map((id) => {
              const item = data.achievements.find(
                (entry) => entry.id === id.toLowerCase().replaceAll(" ", "-"),
              ) ?? { title: id, description: "A thoughtful field milestone." };
              return (
                <span key={id}>
                  <BadgeCheck aria-hidden="true" />
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
              );
            })}
          </div>
        </section>
      )}
      {report.returnedWildlife.length > 0 && (
        <section className="returning-wildlife">
          <h2>Life is returning</h2>
          <div>
            {report.returnedWildlife.map((name) => {
              const sprite = speciesNames.get(name);
              return (
                <span key={name}>
                  {sprite && <WildlifeSprite species={sprite} size={48} />}
                  <strong>{name}</strong>
                  <small>A sign of a changing habitat.</small>
                </span>
              );
            })}
          </div>
        </section>
      )}
      <section className="share-card">
        <div className="share-top">
          <span>WILDPATCH · DAY 01</span>
          <span>STREAK {state.streak}</span>
        </div>
        <strong>
          {report.total}
          <span>/100</span>
        </strong>
        <p>
          {shareGrid} · Wetland · Streak {state.streak}
        </p>
        <button className="share-copy" onClick={() => void copyShare()}>
          {copied && <LeafBurst seed={report.total} />}
          <Clipboard aria-hidden="true" />
          {copied ? "Copied result" : "Copy result"}
        </button>
        <button className="share-comments" onClick={() => setShareOpen(true)}>
          Share to comments
        </button>
        <pre aria-label="Share text preview">{shareText}</pre>
      </section>
      <div className="report-actions">
        <ChunkyButton
          variant="secondary"
          onClick={() => dispatch({ type: "TRY_ANOTHER_PLAN" })}
        >
          Try another plan
        </ChunkyButton>
        <ChunkyButton
          onClick={() => dispatch({ type: "SET_TAB", tab: "Reserve" })}
        >
          View Community Reserve <ArrowRight aria-hidden="true" />
        </ChunkyButton>
      </div>
      <button className="scoring-link" onClick={() => setScoringOpen(true)}>
        How was this scored?
      </button>
      <ScoringSheet open={scoringOpen} onClose={() => setScoringOpen(false)} />
      <BottomSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share your field report"
      >
        <p>Copy this summary into a comment when you&apos;re ready.</p>
        <textarea className="share-textarea" readOnly value={shareText} />
        <ChunkyButton className="full" onClick={() => void copyShare()}>
          <Clipboard aria-hidden="true" />{" "}
          {copied ? "Copied result" : "Copy share text"}
        </ChunkyButton>
      </BottomSheet>
      <span className="sr-only" aria-live="polite">
        Your verified score is {report.total} out of 100.
      </span>
    </>
  );
}
