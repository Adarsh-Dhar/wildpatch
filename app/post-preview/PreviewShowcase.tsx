"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Clock3, LockKeyhole, Sparkles } from "lucide-react";
import { Blight } from "@/components/game/art/Blight";
import { SegmentedControl } from "@/components/game/ui-kit";
import { SettingsProvider } from "@/lib/ui/settings-context";
import { assetUrl } from "@/lib/config";

type PreviewState = "upcoming" | "completed" | "locked";
type CardSize = "short" | "tall" | "compact";
const sizes: CardSize[] = ["short", "tall", "compact"];
export default function PreviewShowcase({ streak }: { streak: number }) {
  const [previewState, setPreviewState] = useState<PreviewState>("upcoming");
  const [size, setSize] = useState<CardSize>("short");
  const [counter, setCounter] = useState(1284);
  const [seconds, setSeconds] = useState(8 * 60 * 42);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((value) => (value <= 1 ? 8 * 60 * 42 : value - 1));
      setCounter((value) => value + (Math.random() > 0.78 ? 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const clock = `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <SettingsProvider>
      <main className="post-preview-page">
        <a className="preview-back" href="/">
          ← Back to WILDPATCH
        </a>
        <header>
          <span className="eyebrow">REDDIT FEED PREVIEW · DEVVIT READY</span>
          <h1>Before the field opens</h1>
          <p>Preview the post card in each format and state.</p>
        </header>
        <div className="preview-controls">
          <SegmentedControl
            value={previewState}
            options={["upcoming", "completed", "locked"] as const}
            ariaLabel="Preview post state"
            onChange={setPreviewState}
          />
          <SegmentedControl
            value={size}
            options={sizes}
            ariaLabel="Preview card size"
            onChange={setSize}
          />
        </div>
        <div className="preview-card-grid">
          {sizes.map((cardSize) => (
            <article
              className={`reddit-preview-card preview-${cardSize}`}
              key={cardSize}
            >
              <img
                src={assetUrl("wetland-dry.webp")}
                alt="Degraded Willow Fen wetland"
              />
              <div className="reddit-preview-vignette" />
              <div className="reddit-card-content">
                <div className="reddit-card-top">
                  <span className="difficulty-badge">
                    INTERMEDIATE · WETLAND
                  </span>
                  <Blight mood="scheming" size={45} />
                </div>
                <div className="reddit-card-copy">
                  <span className="eyebrow">DAILY RESTORATION · 01</span>
                  <h2>WILLOW FEN IS IN TROUBLE</h2>
                  {previewState === "completed" ? (
                    <p className="preview-completed">
                      <Check aria-hidden="true" /> You scored 86/100 · Streak{" "}
                      {streak}
                    </p>
                  ) : previewState === "locked" ? (
                    <p className="preview-locked">
                      <LockKeyhole aria-hidden="true" /> Come back tomorrow
                    </p>
                  ) : (
                    <p>Follow the clues. Find the cause. Help the fen.</p>
                  )}
                </div>
                <div className="reddit-card-bottom">
                  <span>
                    <Clock3 aria-hidden="true" /> ~3 min
                  </span>
                  <span>
                    <Sparkles aria-hidden="true" /> {counter.toLocaleString()}{" "}
                    restorers today
                  </span>
                </div>
                {previewState === "upcoming" ? (
                  <a className="chunky-button full" href="/">
                    Play today&apos;s challenge{" "}
                    <ArrowRight aria-hidden="true" />
                  </a>
                ) : previewState === "completed" ? (
                  <a className="chunky-button chunky-secondary full" href="/">
                    View results <ArrowRight aria-hidden="true" />
                  </a>
                ) : (
                  <button className="preview-locked-button" disabled>
                    Challenge locked
                  </button>
                )}
                {previewState === "upcoming" && (
                  <small className="next-challenge">
                    Next challenge in {clock}
                  </small>
                )}
              </div>
            </article>
          ))}
        </div>
        <p className="preview-note">
          The selected format is <strong>{size}</strong>; all three sizes are
          shown for comparison.
        </p>
      </main>
    </SettingsProvider>
  );
}
