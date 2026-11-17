"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  CircleHelp,
  LockKeyhole,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import type { EvidenceRelation } from "@/lib/types";
import { useReducedMotion } from "@/lib/motion";

export function ParchmentCard({
  children,
  className = "",
  tape = false,
  stamp,
}: {
  children: ReactNode;
  className?: string;
  tape?: boolean;
  stamp?: string;
}) {
  return (
    <section className={`parchment-card ${className}`}>
      {tape && <span className="card-tape" aria-hidden="true" />}
      {stamp && <span className="card-stamp">{stamp}</span>}
      {children}
    </section>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger" | "reward";
export function ChunkyButton({
  children,
  variant = "primary",
  size = "md",
  leafBurst = false,
  className = "",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  leafBurst?: boolean;
}) {
  const [burstId, setBurstId] = useState(0);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (leafBurst) setBurstId((value) => value + 1);
  };
  return (
    <button
      className={`chunky-button chunky-${variant} chunky-${size} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {leafBurst && burstId > 0 && <LeafBurst seed={burstId} />}
    </button>
  );
}

export function StatPill({
  icon,
  value,
  label,
  delta,
}: {
  icon?: ReactNode;
  value: number | string;
  label: string;
  delta?: string;
}) {
  const numeric =
    typeof value === "number" ? value : Number.parseInt(value, 10);
  const [shown, setShown] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!Number.isFinite(numeric) || reduced) {
      setShown(numeric || 0);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / 600);
      setShown(Math.round((numeric || 0) * progress));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [numeric, reduced]);
  return (
    <span className="stat-pill">
      {icon}
      <b>{Number.isFinite(numeric) ? shown.toLocaleString() : value}</b>
      {delta && <small className="stat-delta">{delta}</small>}
      <small>{label}</small>
    </span>
  );
}

export function ConditionMeter({
  label,
  value,
  from,
  delta,
}: {
  label: string;
  value: number;
  from?: number;
  delta?: number;
}) {
  const quality = value < 40 ? "Poor" : value < 70 ? "Fair" : "Good";
  return (
    <div className="condition-meter">
      <div className="condition-meter-head">
        <span>{label}</span>
        <strong>
          {value}
          <small>/100</small>
        </strong>
      </div>
      <div
        className="condition-meter-track"
        role="meter"
        aria-label={`${label}: ${value} out of 100`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <div className="condition-meter-foot">
        <span>{quality}</span>
        {from !== undefined && (
          <span>
            {from} → {value}
          </span>
        )}
        {delta !== undefined && (
          <b className={delta >= 0 ? "delta-positive" : "delta-negative"}>
            {delta >= 0 ? "+" : ""}
            {delta}
          </b>
        )}
      </div>
    </div>
  );
}

export function EvidenceCard({
  title,
  readout,
  relation = "neutral",
  pinned = false,
  isNew = false,
  locked = false,
  cost = 0,
  onPin,
}: {
  title: string;
  readout: string;
  relation?: EvidenceRelation;
  pinned?: boolean;
  isNew?: boolean;
  locked?: boolean;
  cost?: number;
  onPin?: () => void;
}) {
  const Cue =
    relation === "supports"
      ? Check
      : relation === "contradicts"
        ? X
        : CircleHelp;
  return (
    <article className={`evidence-card ${locked ? "evidence-locked" : ""}`}>
      <div className="evidence-card-top">
        <strong>{title}</strong>
        {isNew && <b className="new-ribbon">NEW</b>}
        {onPin && (
          <button
            className={`pin-toggle ${pinned ? "pin-active" : ""}`}
            aria-label={`${pinned ? "Unpin" : "Pin"} ${title}`}
            aria-pressed={pinned}
            onClick={onPin}
          >
            ★
          </button>
        )}
      </div>
      <p>{locked ? "Evidence stays in your notebook." : readout}</p>
      {locked ? (
        <span className="evidence-cue">
          <LockKeyhole /> Locked · {cost} points
        </span>
      ) : (
        <span className={`evidence-cue cue-${relation}`}>
          <Cue aria-hidden="true" />
          {relation === "supports"
            ? "Supports a cause"
            : relation === "contradicts"
              ? "Rules out a cause"
              : "Context clue"}
        </span>
      )}
    </article>
  );
}

export function AgentSpeechBubble({
  children,
  className = "",
  speed = 28,
}: {
  children: string;
  className?: string;
  speed?: number;
}) {
  const [visible, setVisible] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      setVisible(children.length);
      return;
    }
    setVisible(0);
    const timer = window.setInterval(
      () => setVisible((current) => Math.min(children.length, current + 1)),
      speed,
    );
    return () => window.clearInterval(timer);
  }, [children, speed, reduced]);
  return (
    <button
      type="button"
      className={`agent-speech-bubble ${className}`}
      aria-label="Show full field note"
      onClick={() => setVisible(children.length)}
    >
      {children.slice(0, visible)}
      {visible < children.length && (
        <span className="type-caret" aria-hidden="true" />
      )}
    </button>
  );
}

export function ScoreRing({
  score,
  label = "out of 100",
  size = 136,
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const [shown, setShown] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      setShown(score);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / 900);
      setShown(Math.round(score * progress));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [reduced, score]);
  const progress = Math.max(0, Math.min(100, shown)) / 100;
  return (
    <div
      className="score-ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score ${score} ${label}`}
    >
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} />
        <circle
          className="score-arc"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
        {Array.from({ length: 20 }, (_, index) => (
          <line
            key={index}
            x1="60"
            y1="5"
            x2="60"
            y2="10"
            transform={`rotate(${index * 18} 60 60)`}
          />
        ))}
      </svg>
      <div>
        <strong>{shown}</strong>
        <span>{label}</span>
      </div>
      {score >= 85 && (
        <span className="score-laurel" aria-label="Gold medal">
          ✦
        </span>
      )}
    </div>
  );
}

export function StageStepper({
  stage,
}: {
  stage:
    | "Degraded"
    | "Intervention completed"
    | "Early recovery"
    | "Ecological recovery";
}) {
  const labels = [
    "Degraded",
    "Intervention completed",
    "Early recovery",
    "Ecological recovery",
    "Healthy / monitored",
  ];
  const current = labels.indexOf(stage);
  return (
    <ol className="stage-stepper" aria-label={`Recovery stage: ${stage}`}>
      {labels.map((label, index) => (
        <li
          key={label}
          className={
            index === current
              ? "step-current"
              : index < current
                ? "step-complete"
                : "step-future"
          }
        >
          <span>
            {index < current ? <Check aria-hidden="true" /> : index + 1}
          </span>
          <small>{label}</small>
          {index > current && (
            <span className="sr-only">Locked until later</span>
          )}
        </li>
      ))}
    </ol>
  );
}

export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(onClose, 2400);
    return () => window.clearTimeout(id);
  }, [message, onClose]);
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="notebook-toast"
          role="status"
          aria-live="polite"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: reduced ? 0.08 : 0.2 }}
        >
          <Sparkles aria-hidden="true" />
          {message}
          <button aria-label="Dismiss notification" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetTitleId = useId();
  const touchStartY = useRef<number | null>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={dialogRef}
      className={`bottom-sheet ${className}`}
      aria-labelledby={sheetTitleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onTouchStart={(event) => {
        touchStartY.current = event.touches[0]?.clientY ?? null;
      }}
      onTouchEnd={(event) => {
        const distance = event.changedTouches[0]?.clientY ?? 0;
        if (touchStartY.current !== null && distance - touchStartY.current > 80)
          onClose();
        touchStartY.current = null;
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="sheet-handle" aria-hidden="true" />
      <header>
        <h2 id={sheetTitleId}>{title}</h2>
        <button className="icon-button" aria-label="Close" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </header>
      <div className="sheet-content">{children}</div>
    </dialog>
  );
}

export function ConfirmSeal({
  open,
  onCancel,
  onConfirm,
  title,
  children,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <BottomSheet
      open={open}
      onClose={onCancel}
      title={title}
      className="confirm-sheet"
    >
      <motion.div
        className="confirm-seal-art"
        aria-hidden="true"
        initial={
          reduced ? false : { scale: 0.5, y: -18, opacity: 0, rotate: -20 }
        }
        animate={{ scale: 1, y: 0, opacity: 1, rotate: -5 }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: "spring", stiffness: 420, damping: 18 }
        }
      >
        ✦
      </motion.div>
      <div className="confirm-copy">{children}</div>
      <div className="confirm-actions">
        <ChunkyButton variant="secondary" onClick={onCancel}>
          Keep thinking
        </ChunkyButton>
        <ChunkyButton onClick={onConfirm}>Confirm and seal</ChunkyButton>
      </div>
    </BottomSheet>
  );
}

export function PaperSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      className="paper-skeleton"
      aria-label="Loading field notes"
      role="status"
    >
      {Array.from({ length: rows }, (_, index) => (
        <span key={index} style={{ width: `${86 - index * 13}%` }} />
      ))}
    </div>
  );
}

export function LeafBurst({ seed = 0 }: { seed?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <span className="leaf-burst" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <motion.i
          key={`${seed}-${index}`}
          animate={{
            y: [0, -28 - index * 3],
            x: [0, (index - 2.5) * 8],
            opacity: [1, 0],
            rotate: [0, 130],
          }}
          transition={{ duration: 0.65, delay: index * 0.035 }}
        />
      ))}
    </span>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T | null;
  options: readonly T[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="segmented-control" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          className={value === option ? "segment-active" : ""}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function Chip({
  children,
  selected,
  onClick,
  className = "",
}: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`choice-chip ${selected ? "chip-selected" : ""} ${className}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function ProgressBar({
  value,
  max,
  label,
  overrun = false,
  delta,
}: {
  value: number;
  max: number;
  label: string;
  overrun?: boolean;
  delta?: string;
}) {
  const percent = max ? (value / max) * 100 : 0;
  return (
    <div className={`progress-bar ${overrun ? "progress-overrun" : ""}`}>
      <div className="progress-bar-label">
        <span>{label}</span>
        <strong>
          {Math.round(value)} / {max}
          {delta && <small>{delta}</small>}
        </strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <i style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
      </div>
      {overrun && (
        <small className="budget-warning">
          <TriangleAlert aria-hidden="true" /> Over budget by{" "}
          {Math.round(value - max)}
        </small>
      )}
    </div>
  );
}

export function UIIconLabel({ children }: { children: ReactNode }) {
  return (
    <span className="ui-icon-label">
      <BadgeCheck aria-hidden="true" />
      {children}
    </span>
  );
}
