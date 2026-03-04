import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { getAboutPublished } from "@/lib/content/about";
import HeroRotator from "@/components/HeroRotator";

const ABOUT_FALLBACK = {
  title: "About Joshua Schultz",
  paragraphs: [
    "Joshua Schultz is a muralist, designer, and builder born and raised in the Aurora, Illinois area. Creative Edge is his home base — a place to turn ideas into work that feels personal to the space and the people in it.",
    "He’s traveled abroad and brought those influences back with him, pulling inspiration from the music he listens to and plays. Around here, Joshua is also known as a proud squirrel enthusiast — the kind of detail that says a lot about how he sees the world: curious, observant, and always noticing what others miss.",
    "What drives him most is community. The towns and neighborhoods that have supported him are the reason he pushes for excellence — and the reason he loves creating pieces that help put a place on the map.",
    "And while his art travels, his roots run deep. Joshua comes from farming families on both his mom and dad’s side, and he’s a farmer himself. That background shows up in the work: steady hands, respect for the grind, and pride in building something that lasts.",
  ],
  cards: [
    {
      title: "Murals that fit the place",
      body: "Indoor or outdoor, Joshua designs with the building, the street, and the story in mind — so the finished piece feels like it belongs there.",
    },
    {
      title: "Music-led creativity",
      body: "New ideas often start as a sound. The music he listens to and plays shapes the mood, movement, and energy of the work.",
    },
    {
      title: "Built, not just painted",
      body: "From creative installs to light carpentry, the process is hands-on — with the same attention to detail as the artwork itself.",
    },
    {
      title: "Community first",
      body: "The goal is always the same: create something the community is proud of, and help put local spots on the map.",
    },
  ],
  ctaNote:
    "Want this even more personal? Add 2–3 standout projects (location + what made them special) and I’ll weave them into the story.",
};

export default async function HomePage() {
  const about = (await getAboutPublished()) ?? ABOUT_FALLBACK;

  return (
    <main className="relative min-h-screen">
      <SiteHeader />

{/* Hero */}
<section className="relative h-screen w-full overflow-hidden">
  {/* Full-bleed rotating background */}
  <div className="absolute inset-0">
    <HeroRotator
      images={[
        { src: "/hero/1.jpg", alt: "Hero 1" },
        { src: "/hero/2.jpg", alt: "Hero 2" },
        { src: "/hero/3.jpg", alt: "Hero 3" },
        { src: "/hero/4.jpg", alt: "Hero 4" },
        { src: "/hero/5.jpg", alt: "Hero 5" },
        { src: "/hero/6.jpg", alt: "Hero 6" },
        { src: "/hero/7.jpg", alt: "Hero 7" },
      ]}
      intervalMs={6500}
      fadeMs={1600}
    />
  </div>

  {/* Dark overlay for readability */}
  <div className="absolute inset-0 bg-black/55" />

  {/* Content */}
  <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6 pt-24">
    <p className="text-white/80 text-sm tracking-widest uppercase">
      Murals • Graphic Design • Studio Work
    </p>

    <h1 className="mt-4 max-w-3xl text-white text-4xl md:text-6xl font-semibold leading-tight">
      Bold art for Residential, Commercial, and spaces people remember.
    </h1>

    <p className="mt-4 max-w-2xl text-white/85 text-base md:text-lg">
      Creative Edge brings indoor/outdoor murals, original graphic designs, and hands-on
      creative builds to life — inspired by music, shaped by travel, and grounded in
      the communities that support the work.
    </p>

    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href="/portfolio"
        className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
      >
        View Portfolio
      </Link>
      <Link
        href="/request-meeting"
        className="rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
      >
        Request a Meeting
      </Link>
    </div>

    {/* Pills pinned near bottom of hero */}

  </div>
</section>
    </main>
  );
}

function HeroPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10"
    >
      {label}
    </Link>
  );
}

function AboutCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border p-5 hover:shadow-sm transition">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">{body}</p>
    </div>
  );
}