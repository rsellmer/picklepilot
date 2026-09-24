import type { Metadata } from "next";
import "./globals.css";
import "./matches.css";
import "./results.css";
import "./reports.css";
import "./print.css";

export const metadata: Metadata = {
  title: "PicklePilot Captain",
  description: "Independent pickleball lineup, results and reporting workspace for team captains.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
