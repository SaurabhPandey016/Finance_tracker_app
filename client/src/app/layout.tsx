import type { Metadata } from "next";
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
  title: "FinTrack — Personal Finance Tracker",
  description: "Track every rupee and understand every habit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable}`}><body className="min-h-screen"><ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}><AuthProvider><BackendStatusProvider><Navbar/><div className="min-h-screen pt-16">{children}</div><Footer/><Toaster richColors/></BackendStatusProvider></AuthProvider></ThemeProvider></body></html>;
}
