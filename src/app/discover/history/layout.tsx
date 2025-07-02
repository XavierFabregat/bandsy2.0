import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Discovery History | Bandsy",
  description: "View your interaction history and past discoveries on Bandsy",
};

export default function DiscoverHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="from-background to-muted/30 min-h-screen bg-gradient-to-br">
      {children}
    </div>
  );
}
