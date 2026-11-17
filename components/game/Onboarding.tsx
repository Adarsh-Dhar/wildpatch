"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { Blight } from "./art/Blight";
import { Restorer } from "./art/Restorer";
import { ChunkyButton } from "./ui-kit";
import { useSettings } from "@/lib/ui/settings-context";

const cards = [
  {
    title: "Investigate",
    text: "Gather clues from the land. You have 12 research points to spend.",
    art: <Restorer mood="thinking" />,
  },
  {
    title: "Diagnose",
    text: "Use the evidence to choose a cause, affected components, and severity.",
    art: <Restorer mood="thinking" outfit={2} />,
  },
  {
    title: "Restore",
    text: "Build an ordered plan. The verifier rewards sound science and careful spending.",
    art: <Blight mood="sneaky" />,
  },
];
export function Onboarding({
  onStart,
  onScoring,
}: {
  onStart: () => void;
  onScoring: () => void;
}) {
  const { setOnboardingSeen } = useSettings();
  const [index, setIndex] = useState(0);
  const finish = () => {
    setOnboardingSeen(true);
    onStart();
  };
  const current = cards[index];
  return (
    <div className="onboarding-shade">
      <section
        className="onboarding-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <button className="onboarding-skip" onClick={finish}>
          <X aria-hidden="true" /> Skip
        </button>
        <span className="eyebrow">A FIELD JOURNAL GAME</span>
        <div className="onboarding-art">{current.art}</div>
        <h1 id="onboarding-title">
          {index === 2
            ? "Help the fen find its way back."
            : `${current.title} the field.`}
        </h1>
        <p>
          {index === 2
            ? "Small, thoughtful choices can make a real difference to a living landscape."
            : current.text}
        </p>
        <div className="onboarding-dots" aria-label={`Card ${index + 1} of 3`}>
          {cards.map((item, dot) => (
            <i key={item.title} className={dot === index ? "dot-active" : ""} />
          ))}
        </div>
        <ChunkyButton
          className="full"
          onClick={() => (index < 2 ? setIndex(index + 1) : finish())}
        >
          {index < 2 ? (
            <>
              Next <ArrowRight aria-hidden="true" />
            </>
          ) : (
            <>
              Start today&apos;s challenge <Check aria-hidden="true" />
            </>
          )}
        </ChunkyButton>
        <button
          type="button"
          className="onboarding-scoring-link"
          onClick={onScoring}
        >
          How scoring works
        </button>
      </section>
    </div>
  );
}
