import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageCircle,
  Star,
  PlayCircle,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Music2,
  Headphones,
} from "lucide-react";
import {
  getDashboardStats,
  getRecentActivity,
  getUserDisplayName,
  type RecentActivity as RecentActivityType,
} from "@/lib/utils/dashboard";

// Helper function for activity gradients
function getActivityGradient(icon: string): string {
  switch (icon) {
    case "zap":
      return "from-purple-50 to-pink-50";
    case "users":
      return "from-cyan-50 to-blue-50";
    case "trending-up":
      return "from-green-50 to-emerald-50";
    default:
      return "from-gray-50 to-gray-100";
  }
}

// Landing Page Component (for unauthenticated users)
function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-cyan-400/10 dark:from-purple-400/5 dark:via-pink-400/5 dark:to-cyan-400/5" />
        <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 blur-3xl delay-1000" />

        <div className="relative container mx-auto px-4 py-20 text-center sm:py-28">
          <div className="mb-6 flex justify-center">
            <Badge className="border-0 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white">
              <Sparkles className="mr-2 h-4 w-4" />
              Now with AI-powered matching
            </Badge>
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Find Your Perfect{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
              Bandmates
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-xl leading-relaxed sm:text-2xl">
            Connect with musicians who share your passion, style, and goals.
            From garage bands to professional ensembles,
            <span className="text-foreground font-semibold">
              {" "}
              find your musical soulmates.
            </span>
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SignUpButton forceRedirectUrl="/">
              <Button
                size="lg"
                className="transform border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
            </SignUpButton>
            <SignInButton forceRedirectUrl="/">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:hover:border-purple-700 dark:hover:bg-purple-900/20"
              >
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignInButton>
          </div>

          {/* Social proof */}
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-8 text-sm sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-r from-purple-400 to-pink-400 dark:border-gray-900" />
                <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-r from-pink-400 to-red-400 dark:border-gray-900" />
                <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-r from-cyan-400 to-blue-400 dark:border-gray-900" />
              </div>
              <span>Join 10,000+ musicians</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-400">
                {[...Array.from({ length: 5 })].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 py-20 backdrop-blur-sm dark:bg-gray-800/20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              Why Musicians Choose{" "}
              <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Bandsy
              </span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Discover the platform that&apos;s revolutionizing how musicians
              connect and collaborate
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-pink-50 transition-all duration-300 hover:shadow-xl dark:from-purple-900/10 dark:to-pink-900/10">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 transition-transform duration-300 group-hover:scale-110">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">
                  Smart AI Matching
                </h3>
                <p className="text-muted-foreground">
                  Our advanced algorithm matches you with musicians based on
                  instrument, genre, skill level, and location compatibility
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-0 bg-gradient-to-br from-cyan-50 to-blue-50 transition-all duration-300 hover:shadow-xl dark:from-cyan-900/10 dark:to-blue-900/10">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 transition-transform duration-300 group-hover:scale-110">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Audio Samples</h3>
                <p className="text-muted-foreground">
                  Listen to potential bandmates&apos; music before connecting.
                  Share your own samples and showcase your talent
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-xl dark:from-green-900/10 dark:to-emerald-900/10">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 transition-transform duration-300 group-hover:scale-110">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Build Groups</h3>
                <p className="text-muted-foreground">
                  Form bands, manage roles, and collaborate seamlessly with
                  built-in group management tools
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-red-50 transition-all duration-300 hover:shadow-xl dark:from-orange-900/10 dark:to-red-900/10">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 transition-transform duration-300 group-hover:scale-110">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Real-time Chat</h3>
                <p className="text-muted-foreground">
                  Connect instantly with matches through our real-time messaging
                  system with typing indicators
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-0 bg-gradient-to-br from-violet-50 to-purple-50 transition-all duration-300 hover:shadow-xl dark:from-violet-900/10 dark:to-purple-900/10">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 transition-transform duration-300 group-hover:scale-110">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Career Growth</h3>
                <p className="text-muted-foreground">
                  Connect with industry professionals and grow your music career
                  through meaningful collaborations
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-0 bg-gradient-to-br from-pink-50 to-rose-50 transition-all duration-300 hover:shadow-xl dark:from-pink-900/10 dark:to-rose-900/10">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 transition-transform duration-300 group-hover:scale-110">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Quality Profiles</h3>
                <p className="text-muted-foreground">
                  Verified musician profiles with skill ratings, genre
                  preferences, and professional experience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-cyan-600/90" />

        <div className="relative container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl">
              Ready to Find Your Band?
            </h2>
            <p className="mb-8 text-xl text-white/90">
              Join thousands of musicians who have already found their perfect
              collaborators
            </p>
            <SignUpButton forceRedirectUrl="/">
              <Button
                size="lg"
                className="transform border-0 bg-white text-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-xl"
              >
                <Music2 className="mr-2 h-5 w-5" />
                Start Making Music Together
              </Button>
            </SignUpButton>
          </div>
        </div>
      </section>
    </div>
  );
}

// Dashboard Component (for authenticated users)
async function Dashboard() {
  const [dashboardStats, recentActivity, userDisplayName] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getUserDisplayName(),
  ]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-8 w-2 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
            <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
              Welcome back, {userDisplayName}!
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Ready to discover your next musical collaborator? Let&apos;s make
            some music together.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group border-0 bg-gradient-to-br from-purple-50 to-pink-50 transition-all duration-300 hover:shadow-lg dark:from-purple-900/10 dark:to-pink-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    New Matches
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardStats.newMatches}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 transition-transform duration-300 group-hover:scale-110">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 bg-gradient-to-br from-cyan-50 to-blue-50 transition-all duration-300 hover:shadow-lg dark:from-cyan-900/10 dark:to-blue-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Active Groups
                  </p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {dashboardStats.activeGroups}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 transition-transform duration-300 group-hover:scale-110">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-lg dark:from-green-900/10 dark:to-emerald-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Profile Views
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats.profileViews}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 transition-transform duration-300 group-hover:scale-110">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 bg-gradient-to-br from-orange-50 to-red-50 transition-all duration-300 hover:shadow-lg dark:from-orange-900/10 dark:to-red-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Messages
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardStats.unreadMessages}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 transition-transform duration-300 group-hover:scale-110">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
            <div className="h-6 w-2 rounded-full bg-gradient-to-b from-cyan-500 to-blue-500" />
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/discover" className="group">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-pink-50 transition-all duration-300 hover:shadow-xl dark:from-purple-900/10 dark:to-pink-900/10">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 transition-transform duration-300 group-hover:scale-110">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">
                    Discover Musicians
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Find your next bandmate
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile" className="group">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-cyan-50 to-blue-50 transition-all duration-300 hover:shadow-xl dark:from-cyan-900/10 dark:to-blue-900/10">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 transition-transform duration-300 group-hover:scale-110">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">
                    My Profile
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Update your musical identity
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/groups" className="group">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-xl dark:from-green-900/10 dark:to-emerald-900/10">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 transition-transform duration-300 group-hover:scale-110">
                    <Music2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">
                    My Groups
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Manage your bands
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/matches" className="group">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-red-50 transition-all duration-300 hover:shadow-xl dark:from-orange-900/10 dark:to-red-900/10">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 transition-transform duration-300 group-hover:scale-110">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">
                    Messages
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Chat with matches
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity & Quick Tips */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-gray-800/20">
            <CardContent className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <div className="h-5 w-2 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => {
                    const IconComponent =
                      activity.icon === "zap"
                        ? Zap
                        : activity.icon === "users"
                          ? Users
                          : TrendingUp;
                    return (
                      <div
                        key={activity.id}
                        className={`flex items-center gap-3 rounded-lg bg-gradient-to-r p-3 ${getActivityGradient(activity.icon)} dark:from-${activity.icon === "zap" ? "purple" : activity.icon === "users" ? "cyan" : "green"}-900/10 dark:to-${activity.icon === "zap" ? "pink" : activity.icon === "users" ? "blue" : "emerald"}-900/10`}
                      >
                        <div
                          className={`h-8 w-8 bg-gradient-to-r ${activity.gradient} flex items-center justify-center rounded-full`}
                        >
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      No recent activity yet.
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Start exploring to see your activity here!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-gray-800/20">
            <CardContent className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <div className="h-5 w-2 rounded-full bg-gradient-to-b from-cyan-500 to-blue-500" />
                Tips for Success
              </h3>
              <div className="space-y-4">
                <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:from-purple-900/10 dark:to-pink-900/10">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Upload audio samples
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Profiles with samples get 3x more matches
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 p-4 dark:from-cyan-900/10 dark:to-blue-900/10">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Complete your profile
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Add instruments, genres, and experience level
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/10 dark:to-emerald-900/10">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                      <MessageCircle className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Be active in conversations
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Respond to messages within 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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
