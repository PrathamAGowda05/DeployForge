import Link from "next/link";
import { cn } from "@/lib/utils";

const linkButtonClass =
  "inline-flex items-center justify-center border px-3 py-1.5 text-sm font-sans transition-colors duration-150";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border-subtle px-6 py-5 sm:px-8">
        <span className="font-mono text-[10px] tracking-widest text-text-muted">
          DEPLOYFORGE
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-xl text-center">
          <p className="mb-4 font-mono text-xs tracking-widest text-text-muted">
            {"// DEPLOYMENT PLATFORM"}
          </p>

          <h1 className="text-4xl font-medium tracking-tight text-text-primary sm:text-5xl">
            DeployForge
          </h1>

          <p className="mt-4 text-base text-text-secondary">
            Deployment platform dashboard
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className={cn(
                linkButtonClass,
                "border-border-strong bg-bg-surface-raised text-text-primary hover:bg-bg-surface hover:border-text-muted",
              )}
            >
              {">"} SIGN_IN
            </Link>
            <Link
              href="/register"
              className={cn(
                linkButtonClass,
                "border-border-subtle bg-transparent text-text-secondary hover:border-border-strong hover:text-text-primary",
              )}
            >
              CREATE_ACCOUNT
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-border-subtle px-6 py-5 text-center">
        <p className="font-mono text-[10px] text-text-muted">
          Infrastructure deployment management
        </p>
      </footer>
    </div>
  );
}
