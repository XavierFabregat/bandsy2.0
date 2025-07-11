import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Matches | Bandsy",
  description: "Matches on Bandsy",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
