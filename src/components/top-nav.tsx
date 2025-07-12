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
        className="hover:bg-accent/50 active:bg-accent/70 flex items-center gap-4 rounded-lg p-4 transition-all"
      >
        {Icon && (
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Icon className="text-primary h-5 w-5" />
          </div>
        )}
        <div className="flex-1">
          <div className="font-medium">{children}</div>
          {description && (
            <div className="text-muted-foreground text-sm">{description}</div>
          )}
        </div>
        <ChevronRight className="text-muted-foreground h-4 w-4" />
      </Link>
    </DrawerClose>
  );
}

export function TopNav() {
  return (
    <nav className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile-first layout */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Drawer direction="left">
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-full w-[300px] p-0">
                <div className="flex h-full flex-col">
                  <DrawerHeader className="border-primary/20 border-b p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎵</span>
                        <DrawerTitle className="text-xl font-bold">
                          Bandsy
                        </DrawerTitle>
                      </div>
                      <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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

                  <DrawerFooter className="border-primary/20 border-t p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground text-sm">
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
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎵</span>
              <span className="text-foreground text-xl font-bold">Bandsy</span>
            </Link>

            <div className="hidden items-center gap-4 md:flex">
              <SignedIn>
                <NavigationMenu viewport={false}>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/">Home</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/groups">Groups</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Browse</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-4">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/browse"
                                className="flex-row items-center gap-2"
                              >
                                <Search />
                                Search Musicians
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/discover"
                                className="flex-row items-center gap-2"
                              >
                                <Compass />
                                Discover
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
                          className="flex items-center gap-2"
                        >
                          Invites
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/matches"
                          className="flex items-center gap-2"
                        >
                          Matches
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Profile</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-4">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/profile"
                                className="flex-row items-center gap-2"
                              >
                                <UserIcon />
                                My Profile
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/profile/edit"
                                className="flex-row items-center gap-2"
                              >
                                <UserPen />
                                Edit Profile
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Samples</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-4">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/samples"
                                className="flex-row items-center gap-2"
                              >
                                <Music />
                                My Samples
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/samples/upload"
                                className="flex-row items-center gap-2"
                              >
                                <Upload />
                                Upload Sample
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
          <div className="flex items-center gap-2">
            {/* Theme toggle - Desktop only */}
            <div className="hidden md:block">
              <ModeToggle />
            </div>

            {/* Auth Section */}
            <AuthSection />
          </div>
        </div>
      </div>
    </nav>
  );
}
