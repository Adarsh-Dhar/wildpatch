import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const dmSans = localFont({
  src: "../public/fonts/geist-regular.ttf",
  variable: "--font-dm-sans",
  display: "swap",
});
const fraunces = localFont({
  src: "../public/fonts/geist-serif-regular.ttf",
  variable: "--font-fraunces",
  display: "swap",
});
const plexMono = localFont({
  src: "../public/fonts/geist-mono-regular.ttf",
  variable: "--font-plex-mono",
  display: "swap",
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
