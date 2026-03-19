"use client";

import Link from "next/link";

// src/app/admin/graphic-design/page.tsx

const cards = [
  { title: "Logos", href: "/admin/graphic-design/logos" },
  { title: "T-Shirts (Design)", href: "/admin/graphic-design/tshirts" },
  { title: "Album Covers", href: "/admin/graphic-design/album-covers" },
  { title: "Show Posters", href: "/admin/graphic-design/show-posters" },
  { title: "Events", href: "/admin/graphic-design/events" },

  { title: "Merch Products (Store)", href: "/admin/tees" },
];

export default function AdminGraphicDesignHub() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Admin • Graphic Design</h1>
            <p className="mt-2 text-white/70">
              Choose a section to upload new work.
            </p>
          </div>

          <Link href="/admin" className="text-sm underline text-white/70 hover:text-white">
            Admin Home
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-5"
            >
              <div className="text-lg font-semibold">{c.title}</div>
              <div className="mt-2 text-sm text-white/60">Open uploader →</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}