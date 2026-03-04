// src/app/graphic-design/page.tsx
"use client";

import Link from "next/link";
import SoftPageShell from "@/components/SoftPageShell";

const sections = [
  {
    title: "Logos",
    desc: "Brand marks, icons, and identity systems.",
    href: "/graphic-design/logos",
  },
  {
    title: "T-Shirts",
    desc: "Wearable designs, drops, and merch art.",
    href: "/graphic-design/tshirts",
  },
  {
    title: "Album Covers",
    desc: "Cover art and packaging visuals.",
    href: "/graphic-design/album-covers",
  },
  {
    title: "Show Posters",
    desc: "Posters, flyers, and event promotion.",
    href: "/graphic-design/show-posters",
  },
  {
    title: "Events",
    desc: "Event graphics, banners, and social kits.",
    href: "/graphic-design/events",
  },
];

export default function GraphicDesignLandingPage() {
  return (
    <SoftPageShell
  title="Graphic Design"
  subtitle="Logos, tees, album covers, posters, and more"
  variant="oceanNoir"
>
      <main className="mx-auto w-full max-w-6xl px-6 py-10 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Graphic Design
            </h1>
            <p className="mt-2 text-white/70">
              Browse by category — logos, tees, album covers, posters, and events.
            </p>
          </div>
          <Link href="/" className="text-sm underline text-white/70 hover:text-white">
            Home
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-6"
            >
              <div className="text-xl font-semibold">{s.title}</div>
              <div className="mt-2 text-sm text-white/70">{s.desc}</div>
              <div className="mt-5 text-sm text-white/80 underline">
                Open {s.title}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </SoftPageShell>
  );
}