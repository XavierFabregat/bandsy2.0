import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Samples | Bandsy",
  description: "Your samples on Bandsy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
