import Link from "next/link";

const nav = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/graphic-design", label: "Graphic Design" },
  { href: "/media", label: "Press" },
  { href: "/request-meeting", label: "Contact" },
  { href: "/studio", label: "Studio" },
  { href: "/about", label: "About" },
];

export default function SiteHeader() {
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
        >
          Schultz Studio
        </Link>

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
          <Link
            href="/request-meeting"
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90 transition"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* subtle divider */}
      <div className="relative h-px bg-white/10" />
    </header>
  );
}