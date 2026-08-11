import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export default function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center border font-sans transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-3 py-1.5 text-sm",
        variant === "primary" &&
          "border-border-strong bg-bg-surface-raised text-text-primary hover:bg-bg-surface hover:border-text-muted",
        variant === "secondary" &&
          "border-border-subtle bg-transparent text-text-secondary hover:border-border-strong hover:text-text-primary",
        variant === "ghost" &&
          "border-transparent bg-transparent text-text-secondary hover:text-text-primary",
        variant === "danger" &&
          "border-border-subtle bg-transparent text-status-failed hover:border-status-failed/50 hover:bg-status-failed/5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
