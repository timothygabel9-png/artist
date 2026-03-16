import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel_Decorative } from "next/font/google";
import "./globals.css";
import { Playfair_Display } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-art",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ New: calligraphy / gallery-style title font (optional use)
const displayFont = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});

export const metadata = {
  title: {
    default: "Schultz Murals",
    template: "%s | Schultz Murals",
  },
  description:
    "Custom murals, graphic design, and public art by Joshua Schultz. Murals for businesses, offices, restaurants, and public spaces.",

  metadataBase: new URL("https://schultzmurals.com"),

  openGraph: {
    title: "Schultz Murals",
    description:
      "Custom murals and graphic design by artist Joshua Schultz.",
    url: "https://schultzmurals.com",
    siteName: "Schultz Murals",
    images: [
      {
        url: "/hero/1.jpg",
        width: 1200,
        height: 630,
        alt: "Schultz Murals artwork",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Schultz Murals",
    description: "Custom murals and public art by Joshua Schultz.",
    images: ["/hero/1.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      
<body
className={[
  playfair.variable,
  geistSans.variable,
  geistMono.variable,
  displayFont.variable,
  "antialiased bg-neutral-950 text-white",
].join(" ")}
>

  <SiteHeader />   {/* <-- ADD IT HERE */}

  <div className="min-h-screen flex flex-col pt-16">
    <main className="flex-1">{children}</main>

    <footer className="border-t border-white/10 py-8 text-center text-sm text-white/60">
      <div className="space-y-2">
        <p>© {new Date().getFullYear()} Creative Edge</p>
        <p>Aurora, IL • Murals • Tees • Studio Work</p>
      </div>
    </footer>
  </div>

</body>
    </html>
  );
}