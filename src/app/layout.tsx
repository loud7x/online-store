
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
    default: "LOUDEFOOT — eFootball Account Marketplace",
    template: "%s | LOUDEFOOT",
  },
  description:
    "Buy, sell, and exchange eFootball accounts. Get your eFootball coins loaded. Premium marketplace for Nigerian players.",
  keywords: [
    "eFootball",
    "eFootball accounts",
    "buy eFootball account",
    "eFootball coins",
    "account trading",
    "Nigeria",
  ],
  openGraph: {
    title: "LOUDEFOOT — eFootball Account Marketplace",
    description:
      "Buy, sell, exchange accounts and load coins — all in one place.",
    type: "website",
    locale: "en_NG",
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
