import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://code-meets-ai.vercel.app"),
  title: "CODE MEETS AI 💀 | Official Registration & Digital Pass",
  description: "CODE MEETS AI + A LITTLE BIT OF CHAOS 💀 — Official Technology Event Platform, Registration & Digital Gate Entry System",
  icons: {
    icon: "/poster.jpg",
  },
  openGraph: {
    title: "CODE MEETS AI 💀 | Official Event Infrastructure",
    description: "17 September 2026 • Global Institute of Engineering and Technology",
    url: "https://code-meets-ai.vercel.app/",
    siteName: "CODE MEETS AI",
    images: [
      {
        url: "/poster.jpg",
        width: 1200,
        height: 630,
        alt: "CODE MEETS AI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#040711",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} dark`}>
      <body className="font-mono bg-[#040711] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black tech-grid-bg">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
