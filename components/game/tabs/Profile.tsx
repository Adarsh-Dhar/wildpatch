"use client";

import { useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Flame,
  Globe2,
  Leaf,
  LockKeyhole,
  Sprout,
  TreePine,
  Waves,
} from "lucide-react";
import { useGame } from "@/lib/engine/store";
import { useGameData } from "@/lib/data/context";
import { assetUrl } from "@/lib/config";
import { Restorer } from "../art/Restorer";
import { WildlifeSprite, type WildlifeName } from "../art/Wildlife";
import {
  BottomSheet,
  ChunkyButton,
  ConditionMeter,
  ParchmentCard,
  StatPill,
} from "../ui-kit";
import type { Report } from "@/lib/types";

const outfits = ["Fern", "Clay", "Water", "Blight"] as const;
const speciesSprite: Record<string, WildlifeName> = {
  "Great blue heron": "Heron",
  "Marsh frog": "Frog",
  "Green darner": "Dragonfly",
  "River otter": "Otter",
  "Red fox": "Fox",
  Bumblebee: "Bee",
  "Spotted salamander": "Salamander",
  "White-tailed deer": "Deer",
};
export function Profile() {
  const { state, dispatch } = useGame();
  const data = useGameData();
  const [outfitOpen, setOutfitOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<{
    title: string;
    content: string;
    report?: Report;
  } | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<
    (typeof data.species)[number] | null
  >(null);
  const report = state.lastReport;
  const earned = new Set(state.earnedAchievements);
  const discovered = new Set([
    ...data.species.filter((item) => item.discovered).map((item) => item.name),
    ...state.unlockedSpecies.map((name) =>
      name === "Heron"
        ? "Great blue heron"
        : name === "Frog chorus"
          ? "Marsh frog"
          : name === "Dragonfly"
            ? "Green darner"
            : name,
    ),
  ]);
  const todayDone = Boolean(report);
  const journal = [
    ...(report
      ? [
          {
            name: "Willow Fen",
            date: "Today · Day 01",
            score: report.total,
            outcome:
              report.notes[0]?.text ??
              "Your first restoration report is ready.",
            report,
          },
        ]
      : []),
    ...data.journalEntries.map((item) => ({ ...item, report: undefined })),
  ];
  return (
    <>
      <section className="profile-card">
        <div className="profile-cover">
          <span className="profile-sun" />
          <span className="profile-cover-hill" />
          <span className="profile-mark">WILDPATCH FIELD JOURNAL</span>
        </div>
        <div className="profile-identity">
          <button
            className="profile-avatar"
            aria-label="Change restorer outfit"
            onClick={() => setOutfitOpen(true)}
          >
            <Restorer outfit={state.outfit} size={90} />
          </button>
          <span className="profile-level">LVL {data.profile.level}</span>
          <div>
            <h1>{data.profile.name}</h1>
            <p>
              {data.profile.title} · <span>{data.profile.handle}</span>
            </p>
          </div>
          <button className="profile-edit" onClick={() => setOutfitOpen(true)}>
            Change outfit
          </button>
        </div>
        <div className="xp-row">
          <div>
            <span>FIELD EXPERIENCE</span>
            <strong>
              {data.profile.xp.toLocaleString()}{" "}
              <small>/ {data.profile.xpNext.toLocaleString()} XP</small>
            </strong>
          </div>
          <div className="xp-track">
            <i
              style={{
                width: `${(data.profile.xp / data.profile.xpNext) * 100}%`,
              }}
            />
          </div>
        </div>
      </section>
      <div className="profile-stat-grid">
        <StatPill
          icon={<Sprout aria-hidden="true" />}
          label="Projects completed"
          value={
            data.profile.projects + Math.max(0, state.projectsCompleted - 48)
          }
        />
        <StatPill
          icon={<Leaf aria-hidden="true" />}
          label="Restoration points"
          value={state.restorationPoints}
        />
        <StatPill
          icon={<Flame aria-hidden="true" />}
          label="Day streak"
          value={state.streak}
        />
        <StatPill
          icon={<Globe2 aria-hidden="true" />}
          label="Biomes explored"
          value={state.biomesExplored}
        />
      </div>
      <ParchmentCard className="streak-card">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">SHOWING UP MATTERS</span>
            <h2>Your field streak</h2>
          </div>
          <div className="streak-count">
            <Flame aria-hidden="true" /> {state.streak} DAYS
          </div>
        </div>
        <div className="calendar-weekdays">
          {"MTWTFSS".split("").map((day, index) => (
            <small key={`${day}-${index}`}>{day}</small>
          ))}
        </div>
        <div className="calendar-grid">
          {Array.from({ length: 35 }, (_, index) => {
            const todayIndex = 31;
            const played =
              (index < todayIndex &&
                (index % 6 === 2 || index % 5 === 0 || index > 21)) ||
              (index === todayIndex && todayDone);
            const today = index === todayIndex;
            return (
              <span
                key={index}
                className={`${played ? "calendar-played" : ""} ${today ? "calendar-today" : ""} ${index > todayIndex ? "calendar-future" : ""}`}
              >
                {played && <Leaf aria-hidden="true" />}
              </span>
            );
          })}
        </div>
        <div className="calendar-labels">
          <span>5 WEEKS AGO</span>
          <span>
            <i className="calendar-key played" /> Played{" "}
            <i className="calendar-key today" /> Today{" "}
            <i className="calendar-key future" /> Upcoming
          </span>
        </div>
      </ParchmentCard>
      <section className="specialties">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">GROW YOUR KNOW-HOW</span>
            <h2>Specializations</h2>
          </div>
          <span className="tool-count">FIELD SKILLS</span>
        </div>
        <div className="specialty-grid">
          {data.specializations.map((item, index) => (
            <button
              key={item.name}
              className="specialty-item"
              onClick={() =>
                setSelectedEntry({
                  title: item.name,
                  content: `${item.value}% progress. The next tier unlocks at 100% with new tools and deeper investigations.`,
                })
              }
            >
              <span
                className="specialty-ring"
                style={
                  {
                    "--specialty-progress": `${item.value}%`,
                  } as React.CSSProperties
                }
              >
                <span>
                  {index === 0 ? (
                    <Waves />
                  ) : index === 1 ? (
                    <TreePine />
                  ) : index === 2 ? (
                    <Sprout />
                  ) : (
                    <Leaf />
                  )}
                </span>
              </span>
              <strong>{item.name}</strong>
              <small>{item.value}%</small>
              <div className="specialty-track">
                <i style={{ width: `${item.value}%` }} />
              </div>
              <span className="tier-label">
                {item.value >= 100 ? "NEXT TIER UNLOCKED" : "NEXT TIER AT 100%"}
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="achievement-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">FIELD MILESTONES</span>
            <h2>Achievements</h2>
          </div>
          <span className="tool-count">
            {earned.size} / {data.achievements.length}
          </span>
        </div>
        <div className="achievement-grid">
          {data.achievements.map((item) => {
            const id = item.id;
            const isEarned =
              earned.has(id) || (id === "first-restoration" && todayDone);
            return (
              <button
                key={id}
                className={`achievement-badge ${isEarned ? "achievement-earned" : "achievement-locked"}`}
                onClick={() =>
                  setSelectedEntry({
                    title: item.title,
                    content: item.description,
                  })
                }
              >
                <span>
                  {isEarned ? (
                    <BadgeCheck aria-hidden="true" />
                  ) : (
                    <LockKeyhole aria-hidden="true" />
                  )}
                </span>
                <strong>{item.title}</strong>
                <small>{isEarned ? "UNLOCKED" : "LOCKED"}</small>
                {report?.unlockedAchievements.some(
                  (name) => name.toLowerCase().replaceAll(" ", "-") === id,
                ) && <i>NEW</i>}
              </button>
            );
          })}
        </div>
      </section>
      <section className="journal-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">A RECORD OF THE LAND</span>
            <h2>Restoration journal</h2>
          </div>
          <BookOpen aria-hidden="true" />
        </div>
        <div className="journal-list">
          {journal.map((entry) => (
            <button
              className="journal-entry"
              key={`${entry.name}-${entry.date}`}
              onClick={() =>
                setSelectedEntry({
                  title: `${entry.name} · ${entry.date}`,
                  content: entry.outcome,
                  report: entry.report,
                })
              }
            >
              <span className="journal-thumb">
                <img src={assetUrl("wetland-recovering.webp")} alt="" />
              </span>
              <span>
                <small>{entry.date} · WETLAND</small>
                <strong>{entry.name}</strong>
                <em>{entry.outcome}</em>
              </span>
              <b>
                {entry.score}
                <small>/100</small>
              </b>
            </button>
          ))}
        </div>
      </section>
      <section className="encyclopedia">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">FIELD ENCYCLOPEDIA</span>
            <h2>Species notebook</h2>
          </div>
          <span className="tool-count">
            {28 + state.unlockedSpecies.length} / 64 DISCOVERED
          </span>
        </div>
        <div className="species-grid">
          {data.species.map((item) => {
            const found = discovered.has(item.name);
            const sprite = speciesSprite[item.name] ?? "Heron";
            return (
              <button
                className={`species-card ${found ? "" : "species-undiscovered"}`}
                key={item.name}
                onClick={() => found && setSelectedSpecies(item)}
                aria-label={`${item.name}${found ? "" : ", undiscovered"}`}
              >
                <WildlifeSprite
                  species={sprite}
                  state={found ? "discovered" : "silhouette"}
                  size={48}
                />
                <strong>{found ? item.name : "Undiscovered"}</strong>
              </button>
            );
          })}
        </div>
      </section>
      <BottomSheet
        open={outfitOpen}
        onClose={() => setOutfitOpen(false)}
        title="Change restorer outfit"
      >
        <p>Preview an outfit, then equip it across your field journal.</p>
        <div className="outfit-grid">
          {outfits.map((name, index) => (
            <button
              className={`outfit-choice ${state.outfit === index ? "outfit-active" : ""}`}
              key={name}
              onClick={() =>
                dispatch({ type: "SET_OUTFIT", outfit: index as 0 | 1 | 2 | 3 })
              }
            >
              <Restorer outfit={index as 0 | 1 | 2 | 3} size={88} />
              <strong>{name}</strong>
              {state.outfit === index && <small>EQUIPPED</small>}
            </button>
          ))}
        </div>
        <ChunkyButton className="full" onClick={() => setOutfitOpen(false)}>
          Back to field journal
        </ChunkyButton>
      </BottomSheet>
      <BottomSheet
        open={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        title={selectedEntry?.title ?? "Field note"}
      >
        <p>{selectedEntry?.content}</p>
        {selectedEntry?.report && (
          <>
            <h3>What went wrong</h3>
            <p>Drainage altered the wetland water regime.</p>
            <h3>What you did</h3>
            <ol>
              {selectedEntry.report.notes.map((note) => (
                <li key={note.text}>{note.text}</li>
              ))}
            </ol>
            <h3>Ecosystem change</h3>
            {(["water", "soil", "vegetation", "biodiversity"] as const).map(
              (key) => (
                <ConditionMeter
                  key={key}
                  label={key[0].toUpperCase() + key.slice(1)}
                  value={selectedEntry.report!.finalConditions[key]}
                />
              ),
            )}
          </>
        )}
      </BottomSheet>
      <BottomSheet
        open={Boolean(selectedSpecies)}
        onClose={() => setSelectedSpecies(null)}
        title={selectedSpecies?.name ?? "Species note"}
      >
        {selectedSpecies && (
          <>
            <p>{selectedSpecies.habitat}</p>
            <p>
              Helpful field action: <strong>{selectedSpecies.action}</strong>
            </p>
          </>
        )}
      </BottomSheet>
    </>
  );
}
