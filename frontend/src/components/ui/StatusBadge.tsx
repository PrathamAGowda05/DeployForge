import { cn } from "@/lib/utils";

type StatusVariant = "live" | "building" | "failed" | "stopped" | "archived" | "default";

function getStatusVariant(status: string): StatusVariant {
  const upper = status.toUpperCase();

  if (["RUNNING", "LIVE", "SUCCESS", "ACTIVE"].includes(upper)) {
    return "live";
  }

  if (upper === "INACTIVE" || ["PENDING", "BUILDING", "STARTING"].includes(upper)) {
    return "building";
  }

  if (["FAILED", "ERROR"].includes(upper)) {
    return "failed";
  }

  if (upper === "ARCHIVED") {
    return "archived";
  }

  if (["STOPPED"].includes(upper)) {
    return "stopped";
  }

  return "default";
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = getStatusVariant(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide",
        variant === "live" && "border-status-live/30 text-status-live",
        variant === "building" && "border-status-building/30 text-status-building",
        variant === "failed" && "border-status-failed/30 text-status-failed",
        variant === "stopped" && "border-status-stopped/30 text-status-stopped",
        variant === "archived" && "border-text-muted/30 text-text-muted",
        variant === "default" && "border-border-subtle text-text-secondary",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block h-1.5 w-1.5",
          variant === "live" && "bg-status-live",
          variant === "building" && "bg-status-building",
          variant === "failed" && "bg-status-failed",
          variant === "stopped" && "bg-status-stopped",
          variant === "archived" && "bg-text-muted",
          variant === "default" && "bg-text-muted",
        )}
      />
      {status}
    </span>
  );
}
