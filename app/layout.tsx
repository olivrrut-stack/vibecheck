import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Rounded but grown-up display face for the structural label layer (metadata
// strip, eyebrows, the score) so those read as one family and pop, without the
// childish feel of a chunkier rounded font.
const rounded = Nunito({
  variable: "--font-rounded",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const title = "VibeCheck: App rejection risk checker";
const description =
  "Find out if your AI-built app will get rejected before Apple does. Free check, with deep fixes for $5. Built for Cursor, Lovable, Bolt, and Claude Code users.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "VibeCheck",
  title,
  description,
  keywords: [
    "App Store rejection",
    "app review",
    "App Store review guidelines",
    "AI-built app",
    "vibe coding",
    "Cursor",
    "Lovable",
    "Bolt",
    "Claude Code",
    "Replit",
    "indie app developer",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    siteName: "VibeCheck",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  // Match the dark canvas so the mobile browser chrome blends in.
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rounded.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
