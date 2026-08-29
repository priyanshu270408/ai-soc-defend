import type { Severity, AlertStatus } from "@/lib/soc-data";
import { severityColor, severityBgColor, statusColor, statusLabel } from "@/lib/soc-data";
import { cn } from "@/lib/utils";

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        severityBgColor(severity),
        severityColor(severity),
        severity === "critical" && "animate-pulse-critical",
        className
      )}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: AlertStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        statusColor(status),
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
