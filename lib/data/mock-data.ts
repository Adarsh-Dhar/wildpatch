import type { Biome, Parcel, Stage } from "@/lib/types";

export const stages: Stage[] = [
  "Briefing",
  "Investigate",
  "Diagnose",
  "Restore",
  "Report",
];

const conditions = [
  { water: 72, soil: 81, waterQuality: 88, vegetation: 78, biodiversity: 74 },
  { water: 35, soil: 55, waterQuality: 70, vegetation: 48, biodiversity: 52 },
  { water: 61, soil: 67, waterQuality: 76, vegetation: 69, biodiversity: 63 },
  { water: 48, soil: 58, waterQuality: 67, vegetation: 51, biodiversity: 49 },
];
const statuses: Parcel["status"][] = [
  "healthy",
  "healthy",
  "recovering",
  "degraded",
  "healthy",
  "protected",
  "healthy",
  "degraded",
  "recovering",
  "healthy",
  "healthy",
  "degraded",
  "healthy",
  "under-restoration",
  "recovering",
  "healthy",
  "degraded",
  "healthy",
  "healthy",
  "protected",
  "recovering",
  "healthy",
  "degraded",
  "healthy",
];
const parcelNames = [
  "Fern Hollow",
  "Mosswood Creek",
  "Cattail Reach",
  "Reedbank",
  "Foxglove Meadow",
  "Heron Watch",
  "Alder Run",
  "Sedge Point",
  "Otter Bend",
  "Juniper Rise",
  "Willow North",
  "Willow Fen",
  "Birch Flats",
  "Bluebell Marsh",
  "Silver Stream",
  "Pinewater",
  "Clover Field",
  "Rush Pool",
  "Elder Grove",
  "Quiet Bay",
  "Lily Crossing",
  "Thistle Downs",
  "Marshlight",
  "Stonecap",
];

export const parcels: Parcel[] = parcelNames.map((name, index) => {
  const today = index === 11;
  const biome: Biome =
    index < 8
      ? "forest"
      : index < 16
        ? "wetland"
        : index < 22
          ? "grassland"
          : "mountain";
  return {
    id: today
      ? "W-04"
      : `${biome.slice(0, 1).toUpperCase()}-${String(index + 1).padStart(2, "0")}`,
    name,
    biome,
    status: today ? "degraded" : statuses[index],
    conditions: conditions[index % conditions.length],
    severity: today || statuses[index] === "degraded" ? "moderate" : "mild",
    today,
    history: [
      {
        day: 1,
        title: "Field survey completed",
        note: "Baseline habitat conditions recorded.",
      },
      {
        day: 4,
        title: today ? "Drainage concerns noted" : "Community observation",
        note: today
          ? "Water levels are below seasonal range."
          : "Neighbors shared a field note.",
      },
      {
        day: 7,
        title: "Restoration check-in",
        note: "The next field assessment is scheduled.",
      },
    ],
  };
});

export const leaderboard = {
  daily: [
    { name: "mossy_marsh", score: 98, flair: "Wetland keeper" },
    { name: "FernAndFury", score: 94, flair: "Field naturalist" },
    { name: "otterly_wild", score: 91, flair: "Water watcher" },
    { name: "reed_reader", score: 87, flair: "Careful planner" },
    { name: "pond_pioneer", score: 82, flair: "Habitat helper" },
    { name: "quiet_current", score: 78, flair: "Stream scout" },
    { name: "sedge_saver", score: 74, flair: "Native plant friend" },
    { name: "marsh_mender", score: 69, flair: "Field observer" },
    { name: "willow_watcher", score: 63, flair: "Daily restorer" },
    { name: "you", score: 0, flair: "Restoration Specialist", isYou: true },
  ],
  weekly: [
    { name: "FernAndFury", score: 820, flair: "Field naturalist" },
    { name: "mossy_marsh", score: 760, flair: "Wetland keeper" },
    { name: "otterly_wild", score: 640, flair: "Water watcher" },
    { name: "you", score: 0, flair: "Restoration Specialist", isYou: true },
  ],
  community: [
    { name: "otterly_wild", score: 2840, flair: "Reserve steward" },
    { name: "reed_reader", score: 2310, flair: "Habitat helper" },
    { name: "mossy_marsh", score: 1970, flair: "Wetland keeper" },
    { name: "you", score: 0, flair: "Restoration Specialist", isYou: true },
  ],
};

export const milestones = [
  {
    target: 50,
    label: "restorations",
    title: "Otter Habitat",
    detail: "A quiet backwater and sheltered bank for otters.",
    icon: "otter",
  },
  {
    target: 100,
    label: "wetland projects",
    title: "Rare Orchid",
    detail: "A protected patch for a native wetland orchid.",
    icon: "flower",
  },
  {
    target: 250,
    label: "projects",
    title: "Old-Growth Grove",
    detail: "Mature trees create shade, cover, and nesting sites.",
    icon: "tree",
  },
  {
    target: 500,
    label: "projects",
    title: "Heron Rookery",
    detail: "A safe nesting place above the marsh.",
    icon: "heron",
  },
];

export const achievements = [
  {
    id: "first-restoration",
    title: "First successful restoration",
    description: "Complete your first field plan.",
  },
  {
    id: "ten-ecosystems",
    title: "Ten ecosystems restored",
    description: "Help ten habitat parcels recover.",
  },
  {
    id: "daily-streak",
    title: "Five consecutive daily challenges",
    description: "Return to the field for five days.",
  },
  {
    id: "perfect-diagnosis",
    title: "Perfect diagnosis",
    description: "Identify the cause and its affected components.",
  },
  {
    id: "three-biomes",
    title: "Three biomes restored",
    description: "Restore a parcel in three different biomes.",
  },
  {
    id: "hydrologist",
    title: "Hydrologist",
    description: "Restore water flow before planting.",
  },
  {
    id: "frugal-field-worker",
    title: "Frugal field worker",
    description: "Make a high-scoring plan for 70 credits or less.",
  },
];

export const specializations = [
  { name: "Wetland Specialist", value: 82, icon: "water" },
  { name: "Forest Restorer", value: 54, icon: "tree" },
  { name: "Soil Conservationist", value: 38, icon: "soil" },
  { name: "Water Quality Expert", value: 21, icon: "drop" },
];

export const species = [
  {
    name: "Great blue heron",
    discovered: true,
    habitat: "Quiet marsh edges and shallow water.",
    action: "Restore water-flow pathways",
  },
  {
    name: "Marsh frog",
    discovered: true,
    habitat: "Clean, connected pools with native sedges.",
    action: "Plant native sedges",
  },
  {
    name: "Green darner",
    discovered: true,
    habitat: "Still water and healthy emergent plants.",
    action: "Monitor water conditions",
  },
  {
    name: "River otter",
    discovered: false,
    habitat: "Sheltered streams with abundant fish.",
    action: "Re-establish water-flow pathways",
  },
  {
    name: "Red fox",
    discovered: false,
    habitat: "Woodland margins and connected meadows.",
    action: "Plant a habitat grove",
  },
  {
    name: "Bumblebee",
    discovered: false,
    habitat: "Flower-rich grassland edges.",
    action: "Plant native sedges",
  },
  {
    name: "Spotted salamander",
    discovered: false,
    habitat: "Shaded vernal pools and leaf litter.",
    action: "Protect wetland edges",
  },
  {
    name: "White-tailed deer",
    discovered: false,
    habitat: "Mixed woodland and open meadow.",
    action: "Restore habitat corridors",
  },
];

export const journalEntries = [
  {
    name: "Alder Run",
    date: "Day 27",
    score: 91,
    outcome: "A careful water plan brought life back to the stream.",
  },
  {
    name: "Cattail Reach",
    date: "Day 19",
    score: 86,
    outcome: "Native plants are returning along the bank.",
  },
  {
    name: "Fern Hollow",
    date: "Day 12",
    score: 79,
    outcome: "A healthy canopy is beginning to recover.",
  },
];

export const recentRestorations = [
  {
    player: "u/mossy_marsh",
    parcel: "Fern Hollow",
    species: "Heron",
    time: "2m ago",
  },
  {
    player: "u/otterly_wild",
    parcel: "Cattail Reach",
    species: "Frog",
    time: "5m ago",
  },
  {
    player: "u/FernAndFury",
    parcel: "Alder Run",
    species: "Dragonfly",
    time: "8m ago",
  },
  {
    player: "u/reed_reader",
    parcel: "Bluebell Marsh",
    species: "Bee",
    time: "11m ago",
  },
  {
    player: "u/pond_pioneer",
    parcel: "Foxglove Meadow",
    species: "Otter",
    time: "15m ago",
  },
  {
    player: "u/quiet_current",
    parcel: "Willow North",
    species: "Salamander",
    time: "19m ago",
  },
  {
    player: "u/sedge_saver",
    parcel: "Reedbank",
    species: "Heron",
    time: "23m ago",
  },
  {
    player: "u/fern_friend",
    parcel: "Pinewater",
    species: "Frog",
    time: "27m ago",
  },
];
