import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackendStatusProvider } from "@/providers/BackendStatusProvider";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  title: {
    default: "FinTrack — Personal Finance Tracker",
    template: "%s | FinTrack",
  },
  description:
    "Track every rupee and understand every habit with FinTrack. Live demos are available on request.",
  keywords: ["finance tracker", "expense tracker", "budgeting", "personal finance"],
  applicationName: "FinTrack",
  openGraph: {
    type: "website",
    siteName: "FinTrack",
    title: "FinTrack — Personal Finance Tracker",
    description:
      "Track every rupee and understand every habit. Live demos are available on request.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e110c" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7ef" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${jakarta.variable}`}><body className="min-h-screen"><ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}><AuthProvider><BackendStatusProvider><Navbar/><div className="min-h-screen pt-16">{children}</div><Footer/><Toaster richColors/></BackendStatusProvider></AuthProvider></ThemeProvider></body></html>;
}
