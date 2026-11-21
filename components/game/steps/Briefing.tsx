"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  Coins,
  Search,
  Sprout,
} from "lucide-react";
import { useGame } from "@/lib/engine/store";
import { useGameData } from "@/lib/data/context";
import { actionCost } from "@/lib/engine/actions";
import { useSettings } from "@/lib/ui/settings-context";
import { assetUrl } from "@/lib/config";
import { Blight } from "../art/Blight";
import { FenIllustration } from "../art/FenIllustration";
import { AgentSpeechBubble, ChunkyButton, ParchmentCard } from "../ui-kit";

function secondsUntilUtcMidnight() {
  const now = new Date();
  const nextChallenge = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
  return Math.max(0, Math.ceil((nextChallenge - now.getTime()) / 1000));
}

export function Briefing() {
  const { state, dispatch } = useGame();
  const { scenario } = useGameData();
  const { settings } = useSettings();
  const todayReport = state.report ?? state.lastReport;
  const [countdown, setCountdown] = useState(86_400);
  useEffect(() => {
    const updateCountdown = () => setCountdown(secondsUntilUtcMidnight());
    updateCountdown();
    const id = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(id);
  }, []);
  const hours = String(Math.floor(countdown / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((countdown % 3600) / 60)).padStart(2, "0");
  const seconds = String(countdown % 60).padStart(2, "0");
  const objectives = [
    ["Find the cause", state.stage === "Restore" || state.stage === "Report"],
    [
      "Choose a restoration plan",
      state.plan.length > 0 || state.stage === "Report",
    ],
    [
      "Stay within budget",
      Boolean(
        state.report &&
          state.plan.reduce(
            (sum, piece) => sum + actionCost(piece),
            0,
          ) <= 100,
      ),
    ],
  ] as const;
  return (
    <>
      {todayReport && (
        <ParchmentCard className="today-result">
          <span className="eyebrow">TODAY&apos;S RESULT</span>
          <strong>{todayReport.total}/100</strong>
          <div>
            <ChunkyButton
              variant="secondary"
              onClick={() => dispatch({ type: "VIEW_LAST_REPORT" })}
            >
              View report
            </ChunkyButton>
            <ChunkyButton
              onClick={() => dispatch({ type: "TRY_ANOTHER_PLAN" })}
            >
              Try another plan
            </ChunkyButton>
          </div>
        </ParchmentCard>
      )}
      <div className="hero-wrap briefing-hero">
        <img
          className="briefing-land"
          src={assetUrl("wetland-dry.webp")}
          alt={`A low-water wetland at ${scenario.siteName}`}
        />
        <div className="briefing-vignette" />
        <div className="hero-stamp">
          <span>
            DAILY
            <br />
            CHALLENGE
          </span>
          <Sprout aria-hidden="true" />
        </div>
        <Blight mood="scheming" className="briefing-blight" />
        <FenIllustration className="briefing-scenery" siteName={scenario.siteName} />
      </div>
      <AgentSpeechBubble className="briefing-quote">
        {scenario.story}
      </AgentSpeechBubble>
      <div className="mission-heading">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> TODAY&apos;S RESTORATION{" "}
          <span className="tiny-divider">/</span> {scenario.difficulty.toUpperCase()}
        </div>
        <h1>{scenario.headline}</h1>
        <p className="intro-copy">{scenario.summary}</p>
      </div>
      <div className="brief-meta">
        <span>
          <Coins aria-hidden="true" /> {scenario.credits} credits
        </span>
        <span>
          <Search aria-hidden="true" /> {scenario.investigationPoints} research points
        </span>
        <span>
          <Activity aria-hidden="true" /> ~3 min
        </span>
      </div>
      <ParchmentCard className="mission-card" tape>
        <div className="card-topline">
          <span>YOUR FIELD NOTES</span>
          <span className="note-number">WP—001</span>
        </div>
        <div className="mission-badges">
          <span>{scenario.biome.toUpperCase()}</span>
          <span>{scenario.difficulty.toUpperCase()}</span>
        </div>
        {scenario.fieldNotes.map((note, index) => (
          <div className="symptom-row" key={note.title}>
            <span className={`symptom-icon ${["dry", "plant", "wildlife"][index % 3]}`}>
              {index === 0 ? <Search aria-hidden="true" /> : <Sprout aria-hidden="true" />}
            </span>
            <div>
              <strong>{note.title}</strong>
              <small>{note.detail}</small>
            </div>
          </div>
        ))}
        <div className="mission-objectives">
          {objectives.map(([label, done]) => (
            <span key={label} className={done ? "objective-done" : ""}>
              <i>{done && <Check aria-hidden="true" />}</i>
              {label}
            </span>
          ))}
        </div>
      </ParchmentCard>
      <div className="agent-note">
        <Blight size={48} title="Blight, environmental agent" />
        <div>
          <small>FIELD GUIDE</small>
          <p>
            Notice what changed. The best restoration starts with good
            questions.
          </p>
        </div>
      </div>
      <ChunkyButton
        leafBurst
        className="full primary-button"
        onClick={() => dispatch({ type: "SET_STAGE", stage: "Investigate" })}
      >
        Begin investigation <ArrowRight aria-hidden="true" />
      </ChunkyButton>
      <div className="social-proof">
        <span>
          <b>1,284</b> restorers have played today
        </span>
        <span className="social-divider">·</span>
        <span>
          {countdown === 0
            ? "The next challenge is ready. Reload to open it."
            : `Next challenge in ${hours}:${minutes}:${seconds}`}
        </span>
      </div>
      {settings.reducedMotion && (
        <span className="sr-only">Ambient movement is turned off.</span>
      )}
    </>
  );
}
