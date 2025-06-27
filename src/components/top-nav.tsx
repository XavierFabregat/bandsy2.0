import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/app/_components/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { SignedIn } from "@clerk/nextjs";
import { UserIcon, UserPen, Music, Upload } from "lucide-react";

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
                        <Link href="/browse">Browse</Link>
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
