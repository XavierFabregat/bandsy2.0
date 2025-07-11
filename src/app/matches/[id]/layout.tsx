import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Matches | Bandsy",
  description: "Your matches on Bandsy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
