import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse | Bandsy",
  description: "Browse for musicians",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
