"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import { Blight, type BlightMood } from "@/components/game/art/Blight";
import { Restorer } from "@/components/game/art/Restorer";
import { JudgeOak } from "@/components/game/art/JudgeOak";
import { FenIllustration } from "@/components/game/art/FenIllustration";
import { ParcelTile } from "@/components/game/art/ParcelTile";
import { StatusIcon } from "@/components/game/art/StatusIcon";
import {
  WildlifeSprite,
  type WildlifeName,
} from "@/components/game/art/Wildlife";
import {
  BirdFlock,
  Cloud,
  SwayGrass,
} from "@/components/game/art/WorldOrnaments";
import { StampSeal } from "@/components/game/art/StampSeal";
import {
  AgentSpeechBubble,
  BottomSheet,
  ChunkyButton,
  Chip,
  ConditionMeter,
  ConfirmSeal,
  EvidenceCard,
  LeafBurst,
  ParchmentCard,
  PaperSkeleton,
  ProgressBar,
  ScoreRing,
  SegmentedControl,
  StageStepper,
  StatPill,
  Toast,
} from "@/components/game/ui-kit";
import { SettingsProvider } from "@/lib/ui/settings-context";
import { verificationResults } from "@/lib/engine/verify.test-cases";
import type { Biome, ParcelStatus } from "@/lib/types";

const moods: BlightMood[] = ["idle", "scheming", "defeated", "sneaky"];
const species: WildlifeName[] = [
  "Heron",
  "Frog",
  "Dragonfly",
  "Deer",
  "Fox",
  "Bee",
  "Otter",
  "Salamander",
];
const biomes: Biome[] = ["forest", "wetland", "grassland"];
const statuses: ParcelStatus[] = [
  "healthy",
  "degraded",
  "under-restoration",
  "recovering",
  "protected",
];

export default function GalleryShowcase() {
  const [mood, setMood] = useState<BlightMood>("idle");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sealOpen, setSealOpen] = useState(false);
  const [toast, setToast] = useState("A thoughtful field action added.");
  const [filter, setFilter] = useState("All");
  const [showPin, setShowPin] = useState(false);
  return (
    <SettingsProvider>
      <main className="game-gallery">
        <header className="gallery-header">
          <a href="/">← Back to field journal</a>
          <span className="eyebrow">WILDPATCH COMPONENT LIBRARY</span>
          <h1>Field notes &amp; field tools</h1>
          <p>Reusable art, game UI, and verifier samples.</p>
        </header>
        <section className="gallery-section">
          <h2>Characters</h2>
          <div className="gallery-controls">
            {moods.map((value) => (
              <button
                key={value}
                className={mood === value ? "gallery-active" : ""}
                onClick={() => setMood(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="gallery-grid gallery-characters">
            <ParchmentCard>
              <Blight mood={mood} size={116} />
              <h3>Blight · {mood}</h3>
              <p>Floating environmental agent</p>
            </ParchmentCard>
            <ParchmentCard>
              <Restorer mood="thinking" size={116} />
              <h3>Restorer · thinking</h3>
              <p>Field researcher with clipboard</p>
            </ParchmentCard>
            <ParchmentCard>
              <Restorer mood="cheer" outfit={1} size={116} />
              <h3>Restorer · cheering</h3>
              <p>Cheering action pose</p>
            </ParchmentCard>
            {([0, 1, 2, 3] as const).map((outfit) => (
              <ParchmentCard key={`outfit-${outfit}`}>
                <Restorer outfit={outfit} size={104} />
                <h3>{["Fern", "Clay", "Water", "Blight"][outfit]} outfit</h3>
                <p>Equippable field gear</p>
              </ParchmentCard>
            ))}
            <ParchmentCard>
              <JudgeOak mood="approving" size={116} />
              <h3>Judge Oak · approving</h3>
              <p>Verifier with a tiny gavel branch</p>
            </ParchmentCard>
            <ParchmentCard>
              <JudgeOak mood="thoughtful" size={116} />
              <h3>Judge Oak · thoughtful</h3>
              <p>Evaluator considering the evidence</p>
            </ParchmentCard>
            <ParchmentCard>
              <JudgeOak mood="stern" size={116} />
              <h3>Judge Oak · stern</h3>
              <p>Evaluator flags a harmful plan</p>
            </ParchmentCard>
            <ParchmentCard>
              <JudgeOak mood="reviewing" size={116} />
              <h3>Judge Oak · reviewing</h3>
              <p>Preparing the field report</p>
            </ParchmentCard>
          </div>
        </section>
        <section className="gallery-section">
          <h2>Wildlife sprites</h2>
          <div className="gallery-grid gallery-wildlife">
            {species.map((name) => (
              <ParchmentCard key={name}>
                <WildlifeSprite species={name} size={58} />
                <strong>{name}</strong>
                <small>Discovered</small>
              </ParchmentCard>
            ))}
            {species.map((name) => (
              <ParchmentCard key={`${name}-silhouette`}>
                <WildlifeSprite species={name} state="silhouette" size={58} />
                <strong>{name}</strong>
                <small>Silhouette</small>
              </ParchmentCard>
            ))}
          </div>
        </section>
        <section className="gallery-section">
          <h2>Terrain · biome and status</h2>
          <div className="gallery-grid gallery-tiles">
            {biomes.flatMap((biome) =>
              statuses.map((status) => (
                <ParchmentCard key={`${biome}-${status}`}>
                  <ParcelTile biome={biome} status={status} size={94} />
                  <strong>{biome}</strong>
                  <small>{status}</small>
                </ParchmentCard>
              )),
            )}
            <ParchmentCard>
              <ParcelTile biome="mountain" status="protected" size={94} />
              <strong>Mountain</strong>
              <small>Locked silhouette</small>
            </ParchmentCard>
          </div>
        </section>
        <section className="gallery-section">
          <h2>Status icons &amp; field ornaments</h2>
          <div className="gallery-icon-row">
            {statuses.map((status) => (
              <ParchmentCard key={status}>
                <StatusIcon status={status} />
                <span>{status}</span>
              </ParchmentCard>
            ))}
          </div>
          <div className="gallery-ornaments">
            <ParchmentCard>
              <Cloud />
              Drifting cloud
            </ParchmentCard>
            <ParchmentCard>
              <BirdFlock />
              Bird flock
            </ParchmentCard>
            <ParchmentCard>
              <SwayGrass />
              Sway grass
            </ParchmentCard>
            <ParchmentCard>
              <Blight mood="sneaky" />
              Blight Wisp
            </ParchmentCard>
            <ParchmentCard>
              <StampSeal>LOCKED</StampSeal>Wax seal
            </ParchmentCard>
            <ParchmentCard>
              <span className="medal-gold">1</span>
              <span className="medal-silver">2</span>
              <span className="medal-bronze">3</span>Laurel medals
            </ParchmentCard>
            <ParchmentCard>
              <LeafBurst seed={2} />
              Leaf burst
            </ParchmentCard>
            <ParchmentCard>
              <FenIllustration />
              Fen illustration
            </ParchmentCard>
          </div>
        </section>
        <section className="gallery-section">
          <h2>UI kit</h2>
          <div className="gallery-grid gallery-kit">
            <ParchmentCard tape>
              <h3>ParchmentCard</h3>
              <p>Tape and notebook treatments.</p>
            </ParchmentCard>
            <ParchmentCard stamp="FIELD NOTE">
              <h3>Stamped card</h3>
              <p>Optional wax-style label.</p>
            </ParchmentCard>
            <ChunkyButton onClick={() => setToast("Primary action completed.")}>
              Primary button
            </ChunkyButton>
            <ChunkyButton variant="secondary">Secondary button</ChunkyButton>
            <ChunkyButton variant="danger">Danger button</ChunkyButton>
            <ChunkyButton variant="reward">Reward button</ChunkyButton>
            <StatPill
              icon={<Leaf />}
              value={82}
              label="Wetland skill"
              delta="+4"
            />
            <ConditionMeter label="Water" from={35} value={57} delta={22} />
            <EvidenceCard
              title="Water analysis"
              readout="Water table −42cm vs norm"
              relation="supports"
              isNew
              onPin={() => setShowPin((value) => !value)}
              pinned={showPin}
            />
            <EvidenceCard
              title="Rainfall records"
              readout="Rainfall is within 6% of average."
              relation="contradicts"
            />
            <EvidenceCard
              title="Quick observation"
              readout="Ground feels dry. Something straight cuts across the east side."
              relation="neutral"
            />
            <EvidenceCard
              title="Locked habitat survey"
              readout=""
              locked
              cost={3}
            />
            <ChunkyButton size="sm" variant="secondary">
              Small button
            </ChunkyButton>
            <ChunkyButton size="lg" leafBurst>
              Large button · leaf burst
            </ChunkyButton>
            <AgentSpeechBubble>
              I&apos;ve stirred up a little trouble at Willow Fen. Think you can
              figure out why?
            </AgentSpeechBubble>
            <ScoreRing score={86} />
            <StageStepper stage="Early recovery" />
            <PaperSkeleton rows={2} />
            <ProgressBar value={68} max={100} label="Habitat recovery" />
            <div>
              <SegmentedControl
                value={filter}
                options={["All", "Forest", "Wetland"] as const}
                ariaLabel="Gallery filter"
                onChange={setFilter}
              />
              <Chip selected onClick={() => setShowPin((value) => !value)}>
                Pinned clue
              </Chip>
            </div>
            <button
              className="gallery-demo-button"
              onClick={() => setSheetOpen(true)}
            >
              Open bottom sheet
            </button>
            <button
              className="gallery-demo-button"
              onClick={() => setSealOpen(true)}
            >
              Open confirm seal
            </button>
          </div>
        </section>
        <section className="gallery-section">
          <h2>Verifier test cases</h2>
          <p>
            Pure deterministic checks from <code>lib/engine/verify.ts</code>.
          </p>
          <div className="verify-cases">
            {verificationResults.map((result) => (
              <ParchmentCard key={result.label}>
                <strong>{result.label}</strong>
                <span>
                  Expected {result.expected} · Actual {result.score}/100
                </span>
                <b className={result.passes ? "verify-pass" : "verify-fail"}>
                  {result.passes ? "PASS" : "CHECK"}
                </b>
              </ParchmentCard>
            ))}
          </div>
        </section>
        <BottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Notebook bottom sheet"
        >
          <p>Compact, focusable, dismissible, and sized for small screens.</p>
          <ChunkyButton onClick={() => setSheetOpen(false)}>
            Close sheet
          </ChunkyButton>
        </BottomSheet>
        <ConfirmSeal
          open={sealOpen}
          onCancel={() => setSealOpen(false)}
          onConfirm={() => setSealOpen(false)}
          title="Lock the demonstration diagnosis?"
        >
          <p>This sample confirms the wax-seal treatment and modal controls.</p>
        </ConfirmSeal>
        <Toast message={toast} onClose={() => setToast("")} />
      </main>
    </SettingsProvider>
  );
}
