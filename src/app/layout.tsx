import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    default: "Creative Edge | Joshua Schultz",
    template: "%s | Creative Edge",
  },
  description:
    "Murals, graphic tees, studio artwork, and creative builds by Joshua Schultz in Aurora, IL and beyond.",
  metadataBase: new URL("https://hope12.netlify.app"),
  openGraph: {
    title: "Creative Edge | Joshua Schultz",
    description:
      "Murals, graphic tees, studio artwork, and creative builds.",
    url: "https://hope12.netlify.app",
    siteName: "Creative Edge",
    images: [
      {
        url: "/hero.jpg", // make sure this exists in /public
        width: 1200,
        height: 630,
        alt: "Creative Edge artwork preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creative Edge | Joshua Schultz",
    description:
      "Murals, graphic tees, studio artwork, and creative builds.",
    images: ["/hero.jpg"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-white`}
      >
        <div className="min-h-screen flex flex-col">
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