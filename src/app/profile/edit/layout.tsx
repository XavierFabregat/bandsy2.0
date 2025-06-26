import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile | Bandsy",
  description: "Edit your profile on Bandsy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
