"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/graphic-design", label: "Graphic Design" },
  { href: "/media", label: "Press" },
  { href: "/request-meeting", label: "Contact" },
  { href: "/studio", label: "Studio" },
  { href: "/about", label: "About" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* glass background */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-md" />
      {/* subtle top->bottom fade so it blends into hero */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 to-black/10" />

      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-white font-semibold tracking-wide hover:text-white/95 transition"
          onClick={() => setOpen(false)}
        >
          Schultz Studio
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/90">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="hover:text-white transition"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>

          <Link
            href="/request-meeting"
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90 transition"
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Mobile dropdown + backdrop */}
      <div
        className={[
          "md:hidden relative",
          "transition-[max-height,opacity] duration-200 ease-out",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden={!open}
      >
        {/* click-off backdrop (only covers below header) */}
        <div
          className={[
            "fixed left-0 right-0 top-16 bottom-0",
            open ? "bg-black/30" : "bg-transparent",
            "transition-colors duration-200",
          ].join(" ")}
          onMouseDown={() => setOpen(false)}
        />

        {/* panel */}
        <div
          className={[
            "relative border-t border-white/10",
            "bg-black/55 backdrop-blur-md",
            "origin-top",
            "transform transition-transform duration-200 ease-out",
            open ? "translate-y-0" : "-translate-y-2",
          ].join(" ")}
        >
          <div className="mx-auto max-w-6xl px-6 py-3">
            <nav className="grid gap-2">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white transition"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* subtle divider */}
      <div className="relative h-px bg-white/10" />
    </header>
  );
}