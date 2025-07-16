import Link from "next/link";
import { ModeToggle } from "@/app/_components/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { SignedIn } from "@clerk/nextjs";
import {
  UserIcon,
  UserPen,
  Music,
  Upload,
  Search,
  Compass,
  Menu,
  X,
  Home,
  MessageCircle,
  HeartHandshake,
  ChevronRight,
  MicVocal,
} from "lucide-react";
import { AuthSection } from "./auth-section";

export function MobileLink({
  href,
  children,
  icon: Icon,
  description,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  description?: string;
}) {
  return (
    <DrawerClose asChild>
      <Link
        href={href}
        className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 active:from-purple-100/50 active:to-pink-100/50 dark:active:from-purple-800/30 dark:active:to-pink-800/30 flex items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:shadow-sm"
      >
        {Icon && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 group-hover:from-purple-200 group-hover:to-pink-200 dark:group-hover:from-purple-800/50 dark:group-hover:to-pink-800/50 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200">
            <Icon className="text-purple-600 dark:text-purple-400 h-5 w-5" />
          </div>
        )}
        <div className="flex-1">
          <div className="font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{children}</div>
          {description && (
            <div className="text-muted-foreground text-sm group-hover:text-purple-600/70 dark:group-hover:text-purple-400/70 transition-colors">{description}</div>
          )}
        </div>
        <ChevronRight className="text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 h-4 w-4 transition-colors" />
      </Link>
    </DrawerClose>
  );
}

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:border-gray-800/50 dark:bg-gray-900/80 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile-first layout */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Drawer direction="left">
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-full w-[300px] p-0 bg-white/95 backdrop-blur-xl dark:bg-gray-900/95">
                <div className="flex h-full flex-col">
                  <DrawerHeader className="border-b border-gradient-to-r from-purple-200/50 via-pink-200/50 to-cyan-200/50 dark:from-purple-800/50 dark:via-pink-800/50 dark:to-cyan-800/50 p-6 bg-gradient-to-r from-purple-50/30 via-pink-50/30 to-cyan-50/30 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-cyan-900/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-lg font-bold">🎵</span>
                        </div>
                        <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Bandsy
                        </DrawerTitle>
                      </div>
                      <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors">
                          <X className="h-4 w-4" />
                          <span className="sr-only">Close menu</span>
                        </Button>
                      </DrawerClose>
                    </div>
                  </DrawerHeader>

                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                      <div className="mb-6">
                        <h3 className="text-muted-foreground mb-3 px-4 text-sm font-medium">
                          Navigation
                        </h3>
                        <div className="space-y-1">
                          <MobileLink
                            href="/"
                            icon={Home}
                            description="Dashboard and overview"
                          >
                            Home
                          </MobileLink>
                          <MobileLink
                            href="/groups"
                            icon={MicVocal}
                            description="View your groups"
                          >
                            Groups
                          </MobileLink>
                          <MobileLink
                            href="/discover"
                            icon={Compass}
                            description="Find new musicians"
                          >
                            Discover
                          </MobileLink>
                          <MobileLink
                            href="/matches"
                            icon={HeartHandshake}
                            description="View your matches"
                          >
                            Matches
                          </MobileLink>
                          <MobileLink
                            href="/invites"
                            icon={MessageCircle}
                            description="Collaboration requests"
                          >
                            Invites
                          </MobileLink>
                        </div>
                      </div>

                      <div className="border-primary/10 mb-6 border-t pt-6">
                        <h3 className="text-muted-foreground mb-3 px-4 text-sm font-medium">
                          Profile & Content
                        </h3>
                        <div className="space-y-1">
                          <MobileLink
                            href="/profile"
                            icon={UserIcon}
                            description="View your profile"
                          >
                            My Profile
                          </MobileLink>
                          <MobileLink
                            href="/profile/edit"
                            icon={UserPen}
                            description="Edit profile settings"
                          >
                            Edit Profile
                          </MobileLink>
                          <MobileLink
                            href="/samples"
                            icon={Music}
                            description="Your music samples"
                          >
                            My Samples
                          </MobileLink>
                          <MobileLink
                            href="/samples/upload"
                            icon={Upload}
                            description="Upload new content"
                          >
                            Upload Sample
                          </MobileLink>
                        </div>
                      </div>

                      <div className="border-primary/10 border-t pt-6">
                        <h3 className="text-muted-foreground mb-3 px-4 text-sm font-medium">
                          Browse
                        </h3>
                        <div className="space-y-1">
                          <MobileLink
                            href="/browse"
                            icon={Search}
                            description="Search all musicians"
                          >
                            Search Musicians
                          </MobileLink>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DrawerFooter className="border-t border-gradient-to-r from-purple-200/50 via-pink-200/50 to-cyan-200/50 dark:from-purple-800/50 dark:via-pink-800/50 dark:to-cyan-800/50 p-6 bg-gradient-to-r from-purple-50/20 via-pink-50/20 to-cyan-50/20 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-cyan-900/20">
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground text-sm font-medium">
                        © 2024 Bandsy
                      </div>
                      <ModeToggle />
                    </div>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <span className="text-white text-lg font-bold">🎵</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-pink-700 transition-all">Bandsy</span>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              <SignedIn>
                <NavigationMenu viewport={false}>
                  <NavigationMenuList className="gap-1">
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/" className="px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 font-medium hover:text-purple-700 dark:hover:text-purple-300">Home</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/groups" className="px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 font-medium hover:text-purple-700 dark:hover:text-purple-300">Groups</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="px-4 bg-transparent py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 font-medium hover:text-purple-700 dark:hover:text-purple-300">Browse</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[240px] gap-2 p-2 bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 border border-white/20 dark:border-gray-800/50 rounded-xl shadow-lg">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/browse"
                                className="flex flex-row items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center group-hover:from-cyan-200 group-hover:to-blue-200 dark:group-hover:from-cyan-800/50 dark:group-hover:to-blue-800/50 transition-all">
                                  <Search className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <span className="font-medium">Search Musicians</span>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/discover"
                                className="flex flex-row items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 dark:group-hover:from-purple-800/50 dark:group-hover:to-pink-800/50 transition-all">
                                  <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="font-medium">Discover</span>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/invites"
                          className="px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 font-medium hover:text-purple-700 dark:hover:text-purple-300"
                        >
                          Invites
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/matches"
                          className="px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 font-medium hover:text-purple-700 dark:hover:text-purple-300"
                        >
                          Matches
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="px-4 bg-transparent py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 font-medium hover:text-purple-700 dark:hover:text-purple-300">Profile</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[240px] gap-2 p-2 bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 border border-white/20 dark:border-gray-800/50 rounded-xl shadow-lg">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/profile"
                                className="flex flex-row items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-200 dark:group-hover:from-green-800/50 dark:group-hover:to-emerald-800/50 transition-all">
                                  <UserIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="font-medium">My Profile</span>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/profile/edit"
                                className="flex flex-row items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 dark:group-hover:from-orange-800/50 dark:group-hover:to-red-800/50 transition-all">
                                  <UserPen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <span className="font-medium">Edit Profile</span>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="px-4 bg-transparent py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 font-medium hover:text-purple-700 dark:hover:text-purple-300">Samples</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[240px] gap-2 p-2 bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 border border-white/20 dark:border-gray-800/50 rounded-xl shadow-lg">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/samples"
                                className="flex flex-row items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center group-hover:from-violet-200 group-hover:to-purple-200 dark:group-hover:from-violet-800/50 dark:group-hover:to-purple-800/50 transition-all">
                                  <Music className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <span className="font-medium">My Samples</span>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/samples/upload"
                                className="flex flex-row items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-lg flex items-center justify-center group-hover:from-pink-200 group-hover:to-rose-200 dark:group-hover:from-pink-800/50 dark:group-hover:to-rose-800/50 transition-all">
                                  <Upload className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                </div>
                                <span className="font-medium">Upload Sample</span>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </SignedIn>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle - Desktop only */}
            <div className="hidden md:block">
              <ModeToggle />
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-2">
              <AuthSection />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
