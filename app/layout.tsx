import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HERO_VIDEO_POSTER } from "@/lib/hero-video";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Muslim Settify - Earn $3k-$15k Monthly with Remote Appointment Setting",
  description: "Professional training program helping Muslims master remote appointment setting. Build a profitable career from home with our proven system.",
  icons: {
    icon: "/settify-bg.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Main video first: its poster is the one image that must be on
            screen immediately, and its origins are the first we need open. */}
        <link rel="preconnect" href="https://www.loom.com" />
        <link rel="preconnect" href="https://cdn.loom.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://luna.loom.com" />
        <link
          rel="preload"
          as="image"
          href={HERO_VIDEO_POSTER}
          fetchPriority="high"
        />

        {/* Video embeds: warm the connections before the player mounts. */}
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://googlevideo.com" />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
