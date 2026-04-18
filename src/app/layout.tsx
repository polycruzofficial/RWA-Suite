import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Web3Provider } from "@/providers/Web3Provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "EQUITEX — Institutional RWA Tokenization",
  description:
    "The institutional-grade platform for tokenizing real-world assets. Built for BlackRock, JP Morgan, and the world's top banks — with on-chain compliance, stablecoin settlement, and deep liquidity.",
  metadataBase: new URL("https://equitex.finance"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-neutral-950">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
