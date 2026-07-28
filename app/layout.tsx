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
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-ink-app font-sans text-content antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
