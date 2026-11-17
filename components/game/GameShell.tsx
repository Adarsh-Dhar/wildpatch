"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ClipboardCheck, Feather, Sparkles } from "lucide-react";
import { GameProvider, useGame } from "@/lib/engine/store";
import { GameDataProvider, type GameData } from "@/lib/data/context";
import { assetUrl } from "@/lib/config";
import { SettingsProvider, useSettings } from "@/lib/ui/settings-context";
import { TopBar } from "./TopBar";
import { BottomTabs } from "./BottomTabs";
import { StageNav } from "./StageNav";
import { GameErrorBoundary } from "./GameErrorBoundary";
import { SettingsSheet } from "./SettingsSheet";
import { ScoringSheet } from "./ScoringSheet";
import { Onboarding } from "./Onboarding";
import { Briefing } from "./steps/Briefing";
import { Investigate } from "./steps/Investigate";
import { Diagnose } from "./steps/Diagnose";
import { Restore } from "./steps/Restore";
import { Report } from "./steps/Report";
import { WorldMap } from "./tabs/WorldMap";
import { Reserve } from "./tabs/Reserve";
import { Profile } from "./tabs/Profile";
import { LeafBurst, PaperSkeleton, Toast } from "./ui-kit";

export default function GameShell({ initialData }: { initialData: GameData }) {
  return (
    <SettingsProvider>
      <GameDataProvider data={initialData}>
        <GameProvider>
          <GameShellContent />
        </GameProvider>
      </GameDataProvider>
    </SettingsProvider>
  );
}

function GameShellContent() {
  const { state, dispatch } = useGame();
  const { onboardingSeen, setOnboardingSeen } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scoringOpen, setScoringOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(!onboardingSeen);
  const [transitionReady, setTransitionReady] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<string[]>(["Today"]);
  const showTabSkeleton = loadingTab || !loadedTabs.includes(state.tab);
  const reduceMotion = useReducedMotion();
  const dismissToast = useCallback(
    () => dispatch({ type: "SET_TOAST", message: "" }),
    [dispatch],
  );

  useEffect(() => {
    if (loadedTabs.includes(state.tab)) {
      setLoadingTab(false);
      return;
    }
    setLoadingTab(true);
    const id = window.setTimeout(() => {
      setLoadedTabs((tabs) => [...tabs, state.tab]);
      setLoadingTab(false);
    }, 400);
    return () => window.clearTimeout(id);
  }, [loadedTabs, state.tab]);

  useEffect(() => {
    if (!state.verifying || !state.pendingReport) return;
    const id = window.setTimeout(
      () => dispatch({ type: "SHOW_REPORT" }),
      reduceMotion ? 0 : 2600,
    );
    return () => window.clearTimeout(id);
  }, [dispatch, reduceMotion, state.pendingReport, state.verifying]);

  const finishOnboarding = () => {
    setOnboardingSeen(true);
    setOnboardingOpen(false);
  };
  const markTransitionReady = useCallback(() => setTransitionReady(true), []);
  useEffect(() => {
    if (!state.verifying) setTransitionReady(false);
  }, [state.verifying]);

  let page: ReactNode = null;
  if (state.tab === "Today") {
    page = (
      <>
        <StageNav />
        {state.stage === "Briefing" && <Briefing />}
        {state.stage === "Investigate" && <Investigate />}
        {state.stage === "Diagnose" && <Diagnose />}
        {state.stage === "Restore" && <Restore />}
        {state.stage === "Report" && <Report />}
      </>
    );
  } else if (state.tab === "Map") page = <WorldMap />;
  else if (state.tab === "Reserve") page = <Reserve />;
  else page = <Profile />;

  return (
    <main className="game-shell">
      <div className="paper-grain" aria-hidden="true" />
      {state.celebration > 0 && (
        <LeafBurst key={state.celebration} seed={state.celebration} />
      )}
      <TopBar onOpenSettings={() => setSettingsOpen(true)} />
      <div className="game-layout">
        <aside className="desktop-field-aside">
          <div className="desktop-field-art">
            <img
              src={assetUrl("wetland-dry.webp")}
              alt="Willow Fen field preview"
            />
            <span>WILLOW FEN · WETLAND 04</span>
            <Sparkles aria-hidden="true" />
          </div>
          <h2>A field worth noticing.</h2>
          <p>
            Observe the land, follow the clues, and help today&apos;s habitat
            find its way back.
          </p>
          <div className="desktop-field-stat">
            <Feather aria-hidden="true" />
            <span>Daily field journal</span>
            <strong>DAY 01</strong>
          </div>
        </aside>
        <div className="game-main-column">
          <GameErrorBoundary key={state.tab}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${state.tab}-${state.stage}`}
                className="page-content"
                aria-label={`${state.tab} · ${state.stage}`}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.24 }}
              >
                {showTabSkeleton ? <PaperSkeleton rows={5} /> : page}
              </motion.div>
            </AnimatePresence>
          </GameErrorBoundary>
        </div>
      </div>
      <BottomTabs />
      {settingsOpen && (
        <SettingsSheet
          open
          onClose={() => setSettingsOpen(false)}
          onReplay={() => {
            setSettingsOpen(false);
            setOnboardingOpen(true);
          }}
          onScoring={() => {
            setSettingsOpen(false);
            setScoringOpen(true);
          }}
        />
      )}
      <ScoringSheet open={scoringOpen} onClose={() => setScoringOpen(false)} />
      {onboardingOpen && (
        <Onboarding
          onStart={finishOnboarding}
          onScoring={() => setScoringOpen(true)}
        />
      )}
      {state.toast && <Toast message={state.toast} onClose={dismissToast} />}
      <VerificationTransition
        open={state.verifying}
        canSkip={transitionReady}
        onSkip={() => dispatch({ type: "SHOW_REPORT" })}
        onReady={markTransitionReady}
      />
    </main>
  );
}

function VerificationTransition({
  open,
  canSkip,
  onSkip,
  onReady,
}: {
  open: boolean;
  canSkip: boolean;
  onSkip: () => void;
  onReady: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(reduceMotion ? 3 : 0);
  useEffect(() => {
    if (!open) {
      setStep(reduceMotion ? 3 : 0);
      return;
    }
    if (reduceMotion) {
      setStep(3);
      onReady();
      return;
    }
    const timers = [
      window.setTimeout(() => setStep(1), 700),
      window.setTimeout(() => setStep(2), 1400),
      window.setTimeout(() => setStep(3), 2100),
      window.setTimeout(onReady, 1000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [open, onReady, reduceMotion]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="verification-shade"
          role="dialog"
          aria-modal="true"
          aria-label="Verifying your restoration plan"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <section className="verification-card">
            <span className="eyebrow">WILLOW FEN · FIELD REPORT</span>
            <div className="verification-judge">
              <span className="judge-scroll">
                <Feather aria-hidden="true" />
              </span>
              <h2>Judge Oak is reviewing your plan.</h2>
            </div>
            <ol>
              {[
                "Checking your diagnosis…",
                "Checking your plan…",
                "Checking the recovery indicators…",
              ].map((label, index) => (
                <li
                  className={step > index ? "verification-done" : ""}
                  key={label}
                >
                  <i>{step > index && <Check aria-hidden="true" />}</i>
                  {label}
                </li>
              ))}
            </ol>
            {canSkip && (
              <button className="verification-skip" onClick={onSkip}>
                View field report <ClipboardCheck aria-hidden="true" />
              </button>
            )}
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
