import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import { ReactLenis } from "lenis/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Melrose Tutor Club",
  description: "Melrose Tutor Club is a tutoring service based in Melrose, MA, providing personalized academic support to students. We tutor high school students for free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${caveat.variable} antialiased`}
      >
        <ReactLenis root>
          {children}
        </ReactLenis>
      </body>
    </html>
  );
}
