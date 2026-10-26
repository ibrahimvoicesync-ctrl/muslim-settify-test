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
        {/* Main video first: the poster is the one image that must be on
            screen immediately. Both it and the video are same-origin. */}
        <link
          rel="preload"
          as="image"
          href={HERO_VIDEO_POSTER}
          fetchPriority="high"
        />
        <link rel="dns-prefetch" href="https://cdn.loom.com" />

        {/* YouTube is no longer on the critical path — the result cards play
            our own clips and only load a player once someone clicks one. Resolve
            the names so that click is quick; don't open sockets nobody may use. */}
        <link rel="dns-prefetch" href="https://www.youtube-nocookie.com" />
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
