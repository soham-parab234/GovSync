import type { Metadata } from "next";
import "./globals.css";
import "./auth-theme.css";
import "./ui-effects.css";
import {siteConfig} from "./site-config";

export const metadata: Metadata = {
  title: siteConfig.name + " · Citizen Services",
  description: "A working citizen services interoperability prototype with sample department APIs.",
  other: {
    "codex-preview": "development",
  },
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
