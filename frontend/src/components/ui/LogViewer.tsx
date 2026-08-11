import { cn } from "@/lib/utils";

interface LogViewerProps {
  logs: string;
  placeholder?: string;
  className?: string;
}

export default function LogViewer({ logs, placeholder, className }: LogViewerProps) {
  return (
    <div
      className={cn(
        "flex min-h-[20rem] flex-col border border-border-subtle bg-bg-base",
        className,
      )}
    >
      <div className="border-b border-border-subtle px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          {"// LOG OUTPUT"}
        </span>
      </div>
      <pre className="min-h-[16rem] flex-1 overflow-auto p-5 font-mono text-sm leading-relaxed text-text-secondary whitespace-pre-wrap break-words">
        {logs || placeholder || "—"}
      </pre>
    </div>
  );
}
