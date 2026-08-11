import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full border border-border-subtle bg-bg-base px-3.5 py-2.5 text-base text-text-primary placeholder:text-text-muted transition-colors duration-150",
        "hover:border-border-strong focus:border-border-strong focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
