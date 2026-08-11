import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "border border-border-subtle bg-bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export function CardHeader({ children, className, label }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border-subtle px-4 py-3",
        className,
      )}
    >
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-base font-medium uppercase tracking-wide text-text-primary", className)}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
