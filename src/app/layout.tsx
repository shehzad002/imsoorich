import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Monoton } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const monoton = Monoton({
  variable: "--font-billboard",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "ImsooRich Tools — Crypto Bundlers, Snipers & Volume Bots",
  description:
    "Download premium crypto tools for Windows, Linux, and macOS. Bundlers, volume bots, snipers and more. WAGMI.",
  keywords: ["crypto tools", "bundler", "sniper", "volume bot", "solana", "degen"],
  openGraph: {
    title: "ImsooRich Tools — Crypto Tools for Degens",
    description: "Bundlers · Volume · Snipers · Cross-platform downloads",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${monoton.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-void text-gray-200 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
