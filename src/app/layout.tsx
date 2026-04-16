import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rendition | Provo Date Night Ideas",
  description:
    "201 curated date night ideas for Provo, UT. Weather-aware picks, personality quiz, swipe discovery, spin the wheel, and more. Built with Next.js + Supabase.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Rendition — Date nights, curated.",
    description:
      "201 curated date night ideas for Provo. Answer 4 questions, get 3 perfect ideas for tonight.",
    type: "website",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Rendition",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1816" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('rendition-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <BottomNav />
            <InstallPrompt />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
