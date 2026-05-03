import Link from "next/link";
import { Hammer, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Hammer className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Pin<span className="text-primary">Craft</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-accent transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Настройки</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
