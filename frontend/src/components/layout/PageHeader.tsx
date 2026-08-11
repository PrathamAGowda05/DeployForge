import { cn } from "@/lib/utils";

interface PageHeaderProps {
  index?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  index,
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-10 flex flex-col gap-4 border-b border-border-subtle pb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {index && (
          <p className="mb-1 font-mono text-[10px] tracking-widest text-text-muted">
            {index}
          </p>
        )}
        <h1 className="text-2xl font-medium tracking-tight text-text-primary lg:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-base text-text-secondary">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
