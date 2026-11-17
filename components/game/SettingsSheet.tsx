"use client";

import { useState } from "react";
import { BookOpen, Info, Volume2, VolumeX, X } from "lucide-react";
import { BottomSheet, ChunkyButton, SegmentedControl } from "./ui-kit";
import { useSettings } from "@/lib/ui/settings-context";

export function SettingsSheet({
  open,
  onClose,
  onReplay,
  onScoring,
}: {
  open: boolean;
  onClose: () => void;
  onReplay: () => void;
  onScoring: () => void;
}) {
  const { settings, updateSetting } = useSettings();
  const [aboutOpen, setAboutOpen] = useState(false);
  const toggle = (
    key: "soundOn" | "reducedMotion" | "colorblindMode" | "placementGrid",
  ) => (
    <button
      role="switch"
      aria-checked={settings[key]}
      aria-label={`Toggle ${key}`}
      className={`settings-switch ${settings[key] ? "switch-on" : ""}`}
      onClick={() => updateSetting(key, !settings[key])}
    >
      <i />
    </button>
  );
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Your field settings"
      className="settings-sheet"
    >
      <p>Make your field journal feel like yours.</p>
      <div className="setting-row">
        <span>
          <strong>{settings.soundOn ? <Volume2 /> : <VolumeX />} Sound</strong>
          <small>Sound UI preference for a future field mix</small>
        </span>
        {toggle("soundOn")}
      </div>
      <div className="setting-row">
        <span>
          <strong>Reduced motion</strong>
          <small>Keep movement still and gentle</small>
        </span>
        {toggle("reducedMotion")}
      </div>
      <div className="setting-row">
        <span>
          <strong>Colorblind-friendly cues</strong>
          <small>Use patterns with status colors</small>
        </span>
        {toggle("colorblindMode")}
      </div>
      <div className="setting-row">
        <span>
          <strong>Placement grid</strong>
          <small>Show alignment guides in Restore</small>
        </span>
        {toggle("placementGrid")}
      </div>
      <div className="setting-row setting-text-size">
        <span>
          <strong>Text size</strong>
          <small>Adjust reading size throughout the journal</small>
        </span>
        <SegmentedControl
          value={settings.textSize}
          options={["normal", "large"] as const}
          ariaLabel="Text size"
          onChange={(value) => updateSetting("textSize", value)}
        />
      </div>
      <ChunkyButton
        variant="secondary"
        className="full"
        onClick={() => {
          onClose();
          onReplay();
        }}
      >
        <BookOpen aria-hidden="true" /> Replay tutorial
      </ChunkyButton>
      <button className="settings-link" onClick={onScoring}>
        How scoring works
      </button>
      <button
        className="settings-link"
        onClick={() => setAboutOpen((value) => !value)}
      >
        <Info aria-hidden="true" /> About WILDPATCH
      </button>
      {aboutOpen && (
        <p className="about-copy">
          WILDPATCH is a small restoration game about noticing change, asking
          better questions, and planning thoughtful ways to help habitats
          recover.
        </p>
      )}
      <button className="settings-close-link" onClick={onClose}>
        <X aria-hidden="true" /> Back to the field
      </button>
    </BottomSheet>
  );
}
