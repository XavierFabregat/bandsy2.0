import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

// Landing Page Component (for unauthenticated users)
function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
          Find Your Perfect{" "}
          <span className="text-[hsl(280,100%,70%)]">Bandmates</span>
        </h1>
        <p className="mt-6 max-w-2xl text-xl text-gray-300">
          Connect with musicians who share your passion, style, and goals. From
          garage bands to professional ensembles, find your musical soulmates.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
          <SignInButton forceRedirectUrl="/">
            <button className="rounded-full bg-[#6c47ff] px-8 py-3 text-lg font-semibold text-white transition hover:bg-[#5a3fd8]">
              Get Started
            </button>
          </SignInButton>
          <SignUpButton forceRedirectUrl="/">
            <button className="rounded-full border border-white/20 px-8 py-3 text-lg font-semibold text-white transition hover:bg-white/10">
              Sign In
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold">
            Why Musicians Choose Bandsy
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white/5 p-6 text-center">
              <div className="mb-4 text-4xl">🎸</div>
              <h3 className="mb-2 text-xl font-semibold">Smart Matching</h3>
              <p className="text-gray-300">
                Find musicians based on instrument, genre, skill level, and
                location
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-6 text-center">
              <div className="mb-4 text-4xl">🎵</div>
              <h3 className="mb-2 text-xl font-semibold">Audio Samples</h3>
              <p className="text-gray-300">
                Listen to potential bandmates&apos; music before connecting
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-6 text-center">
              <div className="mb-4 text-4xl">🤝</div>
              <h3 className="mb-2 text-xl font-semibold">Build Groups</h3>
              <p className="text-gray-300">
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
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Welcome to Bandsy</h1>
          <UserButton />
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Recent Matches</h3>
            <p className="text-2xl font-bold text-[hsl(280,100%,70%)]">12</p>
          </div>
          <div className="rounded-lg bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Active Groups</h3>
            <p className="text-2xl font-bold text-[hsl(280,100%,70%)]">3</p>
          </div>
          <div className="rounded-lg bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Profile Views</h3>
            <p className="text-2xl font-bold text-[hsl(280,100%,70%)]">47</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/browse"
              className="rounded-lg bg-white/5 p-4 text-center transition hover:bg-white/10"
            >
              <div className="mb-2 text-2xl">👥</div>
              <h3 className="font-semibold">Browse Musicians</h3>
            </Link>
            <Link
              href="/profile"
              className="rounded-lg bg-white/5 p-4 text-center transition hover:bg-white/10"
            >
              <div className="mb-2 text-2xl">👤</div>
              <h3 className="font-semibold">Edit Profile</h3>
            </Link>
            <Link
              href="/groups"
              className="rounded-lg bg-white/5 p-4 text-center transition hover:bg-white/10"
            >
              <div className="mb-2 text-2xl">🎭</div>
              <h3 className="font-semibold">My Groups</h3>
            </Link>
            <Link
              href="/matches"
              className="rounded-lg bg-white/5 p-4 text-center transition hover:bg-white/10"
            >
              <div className="mb-2 text-2xl">💬</div>
              <h3 className="font-semibold">Messages</h3>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Recent Activity</h2>
          <div className="rounded-lg bg-white/5 p-6">
            <p className="text-gray-300">
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
