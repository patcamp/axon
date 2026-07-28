import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "./AppShell";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Axon",
  description: "A personal AI assistant chatbot powered by Groq.",
  appleWebApp: {
    title: "Axon",
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

// viewportFit: "cover" lets the app draw under the iPhone status bar /
// home indicator (needed since it's added to the home screen as a
// standalone PWA) — the safe-* utility classes in globals.css pad
// content back away from those areas.
// maximumScale/userScalable lock zoom at 100% — this is a chat app, not
// a document; without it, mobile Safari auto-zooms in on any input with
// a font-size under 16px, which is also why composer/dialog inputs are
// text-base (16px) below sm: instead of their desktop size.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-svh bg-app font-sans text-primary antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
