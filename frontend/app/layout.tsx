import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import "../styles/globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Hotel Mount Bliss | Comfortable Stay & Hospitality", template: "%s | Hotel Mount Bliss" },
  description: "Discover a calm, comfortable stay with thoughtful hospitality at Hotel Mount Bliss.",
  openGraph: { title: "Hotel Mount Bliss | Comfortable Stay & Hospitality", description: "A premium hotel discovery and booking experience.", type: "website", siteName: "Hotel Mount Bliss" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased"><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
