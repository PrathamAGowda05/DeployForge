import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border-subtle px-6 py-5 sm:px-8">
        <Link href="/" className="inline-block">
          <span className="font-mono text-[10px] tracking-widest text-text-muted">
            DEPLOYFORGE
          </span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <p className="mb-2 font-mono text-xs tracking-widest text-text-muted">
              {"// AUTHENTICATION"}
            </p>
            <h1 className="text-2xl font-medium text-text-primary">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-base text-text-secondary">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
