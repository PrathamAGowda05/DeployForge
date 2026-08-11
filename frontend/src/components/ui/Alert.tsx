import { cn } from "@/lib/utils";

interface AlertProps {
  children: React.ReactNode;
  variant?: "error" | "info";
  className?: string;
}

export default function Alert({ children, variant = "error", className }: AlertProps) {
  return (
    <div
      className={cn(
        "border px-3 py-2 font-mono text-xs",
        variant === "error" && "border-status-failed/30 bg-status-failed/5 text-status-failed",
        variant === "info" && "border-border-subtle bg-bg-surface text-text-secondary",
        className,
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
