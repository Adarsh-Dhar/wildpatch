import GameShell from "@/components/game/GameShell";
import { getInitialGameData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initialData = await getInitialGameData();
  return <GameShell initialData={initialData} />;
}
