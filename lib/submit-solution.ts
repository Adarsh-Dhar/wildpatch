import type { Report, Submission } from "@/lib/types";

export async function submitSolution(
  submission: Submission,
  scenarioId: string,
): Promise<Report> {
  const response = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...submission, scenarioId }),
  });
  const result = (await response.json()) as Report | { error?: string };

  if (!response.ok) {
    throw new Error(
      "error" in result ? result.error ?? "Could not verify your report." : "Could not verify your report.",
    );
  }

  return result as Report;
}
