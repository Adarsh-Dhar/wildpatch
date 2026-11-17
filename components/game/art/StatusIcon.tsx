import {
  Check,
  CircleDot,
  LockKeyhole,
  Shield,
  Shovel,
  Sprout,
} from "lucide-react";
import type { ParcelStatus } from "@/lib/types";

export function StatusIcon({ status }: { status: ParcelStatus }) {
  if (status === "healthy")
    return <Check aria-hidden="true" data-status-icon="healthy" />;
  if (status === "degraded")
    return (
      <span
        className="cracked-leaf-icon"
        aria-hidden="true"
        data-status-icon="degraded"
      >
        ⌁
      </span>
    );
  if (status === "under-restoration")
    return <Shovel aria-hidden="true" data-status-icon="under-restoration" />;
  if (status === "recovering")
    return <Sprout aria-hidden="true" data-status-icon="recovering" />;
  if (status === "protected")
    return <Shield aria-hidden="true" data-status-icon="protected" />;
  return <LockKeyhole aria-hidden="true" data-status-icon="locked" />;
}
export function StatusLegendIcon({ status }: { status: ParcelStatus }) {
  return (
    <span className={`status-legend-icon status-${status}`}>
      <StatusIcon status={status} />
      {status === "recovering" && <CircleDot aria-hidden="true" />}
    </span>
  );
}
