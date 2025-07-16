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
  Headphones
} from "lucide-react";
import { 
  getDashboardStats, 
  getRecentActivity, 
  getUserDisplayName,
  type RecentActivity as RecentActivityType
} from "@/lib/utils/dashboard";

// Helper function for activity gradients
function getActivityGradient(icon: string): string {
  switch (icon) {
    case 'zap':
      return 'from-purple-50 to-pink-50';
    case 'users':
      return 'from-cyan-50 to-blue-50';
    case 'trending-up':
      return 'from-green-50 to-emerald-50';
    default:
      return 'from-gray-50 to-gray-100';
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative container mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="mb-6 flex justify-center">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Now with AI-powered matching
            </Badge>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Find Your Perfect{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
              Bandmates
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Connect with musicians who share your passion, style, and goals. From garage bands to professional ensembles,
            <span className="text-foreground font-semibold"> find your musical soulmates.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SignUpButton forceRedirectUrl="/">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
            </SignUpButton>
            <SignInButton forceRedirectUrl="/">
              <Button variant="outline" size="lg" className="border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:hover:border-purple-700 dark:hover:bg-purple-900/20">
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </SignInButton>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white dark:border-gray-900" />
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full border-2 border-white dark:border-gray-900" />
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
              <span>Join 10,000+ musicians</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-400">
                {[...Array.from({ length: 5 })].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Why Musicians Choose{" "}
              <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Bandsy
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the platform that&apos;s revolutionizing how musicians connect and collaborate
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="mb-6 mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart AI Matching</h3>
                <p className="text-muted-foreground">
                  Our advanced algorithm matches you with musicians based on instrument, genre, skill level, and location compatibility
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="mb-6 mx-auto w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Audio Samples</h3>
                <p className="text-muted-foreground">
                  Listen to potential bandmates&apos; music before connecting. Share your own samples and showcase your talent
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="mb-6 mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Build Groups</h3>
                <p className="text-muted-foreground">
                  Form bands, manage roles, and collaborate seamlessly with built-in group management tools
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="mb-6 mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Chat</h3>
                <p className="text-muted-foreground">
                  Connect instantly with matches through our real-time messaging system with typing indicators
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="mb-6 mx-auto w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Career Growth</h3>
                <p className="text-muted-foreground">
                  Connect with industry professionals and grow your music career through meaningful collaborations
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="mb-6 mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Quality Profiles</h3>
                <p className="text-muted-foreground">
                  Verified musician profiles with skill ratings, genre preferences, and professional experience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-cyan-600/90" />

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Find Your Band?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of musicians who have already found their perfect collaborators
            </p>
            <SignUpButton forceRedirectUrl="/">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Music2 className="w-5 h-5 mr-2" />
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
    getUserDisplayName()
  ]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome back, {userDisplayName}!
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Ready to discover your next musical collaborator? Let&apos;s make some music together.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New Matches</p>
                  <p className="text-2xl font-bold text-purple-600">{dashboardStats.newMatches}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Groups</p>
                  <p className="text-2xl font-bold text-cyan-600">{dashboardStats.activeGroups}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardStats.profileViews}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Messages</p>
                  <p className="text-2xl font-bold text-orange-600">{dashboardStats.unreadMessages}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="w-2 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/discover" className="group">
              <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Discover Musicians</h3>
                  <p className="text-sm text-muted-foreground">Find your next bandmate</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile" className="group">
              <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 mx-auto w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">My Profile</h3>
                  <p className="text-sm text-muted-foreground">Update your musical identity</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/groups" className="group">
              <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Music2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">My Groups</h3>
                  <p className="text-sm text-muted-foreground">Manage your bands</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/matches" className="group">
              <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Messages</h3>
                  <p className="text-sm text-muted-foreground">Chat with matches</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity & Quick Tips */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => {
                    const IconComponent = activity.icon === 'zap' ? Zap : 
                                        activity.icon === 'users' ? Users : TrendingUp;
                    return (
                      <div key={activity.id} className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${getActivityGradient(activity.icon)} dark:from-${activity.icon === 'zap' ? 'purple' : activity.icon === 'users' ? 'cyan' : 'green'}-900/10 dark:to-${activity.icon === 'zap' ? 'pink' : activity.icon === 'users' ? 'blue' : 'emerald'}-900/10`}>
                        <div className={`w-8 h-8 bg-gradient-to-r ${activity.gradient} rounded-full flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">Start exploring to see your activity here!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                Tips for Success
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Upload audio samples</p>
                      <p className="text-xs text-muted-foreground mt-1">Profiles with samples get 3x more matches</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Complete your profile</p>
                      <p className="text-xs text-muted-foreground mt-1">Add instruments, genres, and experience level</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Be active in conversations</p>
                      <p className="text-xs text-muted-foreground mt-1">Respond to messages within 24 hours</p>
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
