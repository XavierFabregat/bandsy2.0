import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

// Landing Page Component (for unauthenticated users)
function LandingPage() {
  return (
    <main className="from-background to-muted text-foreground flex min-h-screen flex-col bg-gradient-to-b">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
          Find Your Perfect <span className="text-primary">Bandmates</span>
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl text-xl">
          Connect with musicians who share your passion, style, and goals. From
          garage bands to professional ensembles, find your musical soulmates.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
          <SignInButton forceRedirectUrl="/">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 text-lg font-semibold transition-colors">
              Get Started
            </button>
          </SignInButton>
          <SignUpButton forceRedirectUrl="/">
            <button className="border-border text-foreground hover:bg-muted rounded-full border px-8 py-3 text-lg font-semibold transition-colors">
              Sign In
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-foreground mb-12 text-center text-4xl font-bold">
            Why Musicians Choose Bandsy
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-card border-border rounded-lg border p-6 text-center">
              <div className="mb-4 text-4xl">🎸</div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Smart Matching
              </h3>
              <p className="text-muted-foreground">
                Find musicians based on instrument, genre, skill level, and
                location
              </p>
            </div>
            <div className="bg-card border-border rounded-lg border p-6 text-center">
              <div className="mb-4 text-4xl">🎵</div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Audio Samples
              </h3>
              <p className="text-muted-foreground">
                Listen to potential bandmates&apos; music before connecting
              </p>
            </div>
            <div className="bg-card border-border rounded-lg border p-6 text-center">
              <div className="mb-4 text-4xl">🤝</div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Build Groups
              </h3>
              <p className="text-muted-foreground">
                Form bands, manage roles, and collaborate seamlessly
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Dashboard Component (for authenticated users)
function Dashboard() {
  return (
    <main className="from-background to-muted text-foreground flex min-h-screen flex-col bg-gradient-to-b">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-foreground text-3xl font-bold">
            Welcome to Bandsy
          </h1>
          <UserButton />
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="text-foreground text-lg font-semibold">
              Recent Matches
            </h3>
            <p className="text-primary text-2xl font-bold">12</p>
          </div>
          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="text-foreground text-lg font-semibold">
              Active Groups
            </h3>
            <p className="text-primary text-2xl font-bold">3</p>
          </div>
          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="text-foreground text-lg font-semibold">
              Profile Views
            </h3>
            <p className="text-primary text-2xl font-bold">47</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/browse"
              className="bg-card border-border hover:bg-muted rounded-lg border p-4 text-center transition-colors"
            >
              <div className="mb-2 text-2xl">👥</div>
              <h3 className="text-foreground font-semibold">
                Browse Musicians
              </h3>
            </Link>
            <Link
              href="/profile"
              className="bg-card border-border hover:bg-muted rounded-lg border p-4 text-center transition-colors"
            >
              <div className="mb-2 text-2xl">👤</div>
              <h3 className="text-foreground font-semibold">Edit Profile</h3>
            </Link>
            <Link
              href="/groups"
              className="bg-card border-border hover:bg-muted rounded-lg border p-4 text-center transition-colors"
            >
              <div className="mb-2 text-2xl">🎭</div>
              <h3 className="text-foreground font-semibold">My Groups</h3>
            </Link>
            <Link
              href="/matches"
              className="bg-card border-border hover:bg-muted rounded-lg border p-4 text-center transition-colors"
            >
              <div className="mb-2 text-2xl">💬</div>
              <h3 className="text-foreground font-semibold">Messages</h3>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Recent Activity
          </h2>
          <div className="bg-card border-border rounded-lg border p-6">
            <p className="text-muted-foreground">
              No recent activity. Start browsing musicians to see updates here!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  );
}
