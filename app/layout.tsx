import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Wildpatch — Restore a little wild",
  description:
    "Investigate a living landscape, diagnose what is changing it, and build a thoughtful restoration plan.",
  generator: "v0.app",
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#FAF6EA",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`antialiased ${dmSans.variable} ${fraunces.variable} ${plexMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
