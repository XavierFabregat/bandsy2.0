import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/app/_components/mode-toggle";

export function TopNav() {
  return (
    <nav className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎵</span>
              <span className="text-foreground text-xl font-bold">Bandsy</span>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button (we'll implement this later) */}
            <button className="md:hidden">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Theme toggle */}
            <ModeToggle />

            {/* User menu */}
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
