import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CoPilotHeader } from "@/components/CoPilotHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clinical CoPilot for Sonographers | CloudSono.AI",
  description: "Educational ultrasound calculators, criteria, and clinical tools for sonography students & professionals.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  themeColor: "#0ea5e9",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Clinical CoPilot",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <CoPilotHeader />
        <main className="min-h-screen bg-zinc-950 text-zinc-100">
          {children}
        </main>
      </body>
    </html>
  );
}