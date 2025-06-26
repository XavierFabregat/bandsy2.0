import { type Metadata } from "next";
import { getUserByUsername } from "@/server/queries";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { username } = await params;

  // Try to get user data for better metadata
  const user = await getUserByUsername(username);

  if (user) {
    return {
      title: `${user.displayName} (@${username}) | Bandsy`,
      description: user.bio
        ? `${user.bio.substring(0, 160)}...`
        : `Check out ${user.displayName}'s profile on Bandsy`,
      openGraph: {
        title: `${user.displayName} (@${username})`,
        description: user.bio?.substring(0, 160) ?? `Musician on Bandsy`,
        type: "profile",
        images: user.profileImageUrl ? [user.profileImageUrl] : undefined,
      },
      twitter: {
        card: "summary",
        title: `${user.displayName} (@${username})`,
        description: user.bio?.substring(0, 160) ?? `Musician on Bandsy`,
        images: user.profileImageUrl ? [user.profileImageUrl] : undefined,
      },
    };
  }

  // Fallback metadata if user not found
  return {
    title: `@${username} | Bandsy`,
    description: `User profile on Bandsy`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
