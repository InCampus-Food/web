import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import TopNavbar from "@/components/common/TopNavbar";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "inCampus Food Delivery",
  description: "Campus food delivery system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${outfit.variable} ${geistMono.variable} antialiased min-h-screen bg-muted/20 flex flex-col text-foreground font-sans`}>
        <TopNavbar />
        <div className="w-full flex-1 flex flex-col relative">
          {children}
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
