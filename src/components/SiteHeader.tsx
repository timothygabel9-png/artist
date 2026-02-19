import Link from "next/link";

const nav = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/tees", label: "Graphic Tees" },
  { href: "/media", label: "Media" },
  { href: "/request-meeting", label: "Request Meeting" },
  { href: "/studio", label: "Studio" },
];

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-white font-semibold tracking-wide">
          Creative Edge
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/90">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/request-meeting"
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* subtle divider */}
      <div className="h-px bg-white/10" />
    </header>
  );
}
