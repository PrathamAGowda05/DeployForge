import { cn } from "@/lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  mono?: boolean;
}

export default function Label({ mono, className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-xs uppercase tracking-wider text-text-muted",
        mono && "font-mono normal-case tracking-normal",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}
