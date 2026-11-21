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
import { actionCost } from "@/lib/engine/actions";
import { useSettings } from "@/lib/ui/settings-context";
import { assetUrl, gameConfig } from "@/lib/config";
import { Blight } from "../art/Blight";
import { FenIllustration } from "../art/FenIllustration";
import { AgentSpeechBubble, ChunkyButton, ParchmentCard } from "../ui-kit";

export function Briefing() {
  const { state, dispatch } = useGame();
  const { settings } = useSettings();
  const todayReport = state.report ?? state.lastReport;
  const [countdown, setCountdown] = useState(
    gameConfig.challengeCountdownSeconds,
  );
  useEffect(() => {
    const id = window.setInterval(
      () =>
        setCountdown((value) =>
          value <= 0 ? gameConfig.challengeCountdownSeconds : value - 1,
        ),
      1000,
    );
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
          alt="A low-water Willow Fen wetland"
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
        <FenIllustration className="briefing-scenery" />
      </div>
      <AgentSpeechBubble className="briefing-quote">
        I&apos;ve stirred up a little trouble at Willow Fen. Think you can
        figure out why?
      </AgentSpeechBubble>
      <div className="mission-heading">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> TODAY&apos;S RESTORATION{" "}
          <span className="tiny-divider">/</span> INTERMEDIATE
        </div>
        <h1>
          Willow Fen
          <br />
          <em>is in trouble.</em>
        </h1>
        <p className="intro-copy">
          Something has unsettled this quiet wetland. Follow the clues, find the
          cause, and help the fen find its way back.
        </p>
      </div>
      <div className="brief-meta">
        <span>
          <Coins aria-hidden="true" /> 100 credits
        </span>
        <span>
          <Search aria-hidden="true" /> 12 research points
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
          <span>WETLAND</span>
          <span>INTERMEDIATE</span>
        </div>
        <div className="symptom-row">
          <span className="symptom-icon dry">
            <Search aria-hidden="true" />
          </span>
          <div>
            <strong>Falling water levels</strong>
            <small>The fen sits 42cm below its seasonal norm</small>
          </div>
        </div>
        <div className="symptom-row">
          <span className="symptom-icon plant">
            <Sprout aria-hidden="true" />
          </span>
          <div>
            <strong>Declining native sedges</strong>
            <small>Marsh plants have declined by nearly a third</small>
          </div>
        </div>
        <div className="symptom-row">
          <span className="symptom-icon wildlife">
            <Sprout aria-hidden="true" />
          </span>
          <div>
            <strong>Fewer frogs and herons</strong>
            <small>The wetland chorus has grown quiet</small>
          </div>
        </div>
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
          Next challenge in {hours}:{minutes}:{seconds}
        </span>
      </div>
      {settings.reducedMotion && (
        <span className="sr-only">Ambient movement is turned off.</span>
      )}
    </>
  );
}
