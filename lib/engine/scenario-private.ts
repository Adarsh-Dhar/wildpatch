import type { CauseId, ComponentId, Severity } from "@/lib/types";

export const scenarioTruth = {
  cause: "drainage" as CauseId,
  components: ["hydrology", "soil", "vegetation", "wildlife"] as ComponentId[],
  severity: "moderate" as Severity,
};
