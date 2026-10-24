import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LoudVault — Game Account Marketplace",
    template: "%s | LoudVault",
  },
  description:
    "Buy, sell, and exchange eFootball, Free Fire and CODM accounts safely. Secure payments and verified sellers. Premium marketplace for Nigerian gamers.",
  keywords: [
    "LoudVault",
    "game accounts",
    "buy game account",
    "sell game account",
    "eFootball accounts",
    "Free Fire accounts",
    "CODM accounts",
    "Call of Duty Mobile accounts",
    "account trading",
    "Nigeria",
  ],
  openGraph: {
    title: "LoudVault — Game Account Marketplace",
    description:
      "Buy, sell and exchange eFootball, Free Fire and CODM accounts — all in one place.",
    type: "website",
    locale: "en_NG",
    siteName: "LoudVault",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
