import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Conversation | Bandsy",
  description: "Match conversation page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
