import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "CompensIQ — Compensation Intelligence",
  description: "Real salary data for engineering roles in India. Compare TC by level, company, and role.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans text-slate-900">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
