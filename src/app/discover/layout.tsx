import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover | Bandsy",
  description: "Discover new bands on Bandsy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
