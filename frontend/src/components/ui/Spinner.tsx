import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export default function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-3 w-3 animate-pulse border border-border-strong bg-bg-surface-raised" />
      <span className="font-mono text-xs text-text-muted">{label}...</span>
    </div>
  );
}
