import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative min-h-screen">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero.jpg')" }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Content */}
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 pt-20">
          <p className="text-white/80 text-sm tracking-widest uppercase">
            Murals • Graphic Tees • Studio Work
          </p>

          <h1 className="mt-4 max-w-3xl text-white text-4xl md:text-6xl font-semibold leading-tight">
            Bold art for walls, shirts, and spaces people remember.
          </h1>

          <p className="mt-4 max-w-2xl text-white/85 text-base md:text-lg">
            Creative Edge brings indoor/outdoor murals, original graphic tees, and hands-on
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

          {/* Lower pill menu */}
          <div className="mt-12">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-black/35 p-2 backdrop-blur">
              <HeroPill href="/portfolio" label="Portfolio" />
              <HeroPill href="/tees" label="Graphic Tees" />
              <HeroPill href="/media" label="Media" />
              <HeroPill href="/studio" label="Studio" />
              <HeroPill href="/request-meeting" label="Request Meeting" />
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                About Joshua Schultz
              </h2>

              <p className="mt-4 text-gray-700 leading-relaxed">
                Joshua Schultz is a muralist, designer, and builder born and raised in the
                Aurora, Illinois area. Creative Edge is his home base — a place to turn
                ideas into work that feels personal to the space and the people in it.
              </p>

              <p className="mt-4 text-gray-700 leading-relaxed">
                He’s traveled abroad and brought those influences back with him, pulling
                inspiration from the music he listens to and plays. Around here, Joshua
                is also known as a proud squirrel enthusiast — the kind of detail that
                says a lot about how he sees the world: curious, observant, and always
                noticing what others miss.
              </p>

              <p className="mt-4 text-gray-700 leading-relaxed">
                What drives him most is community. The towns and neighborhoods that have
                supported him are the reason he pushes for excellence — and the reason he
                loves creating pieces that help put a place on the map.
              </p>

              <p className="mt-4 text-gray-700 leading-relaxed">
                And while his art travels, his roots run deep. Joshua comes from farming
                families on both his mom and dad’s side, and he’s a farmer himself. That
                background shows up in the work: steady hands, respect for the grind, and
                pride in building something that lasts.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/request-meeting"
                  className="rounded-md bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-black/90"
                >
                  Request a Meeting
                </Link>
                <Link
                  href="/portfolio"
                  className="rounded-md border border-black/20 px-5 py-3 text-sm font-semibold text-black hover:bg-black/5"
                >
                  See Completed Work
                </Link>
              </div>
            </div>

            <div className="md:col-span-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AboutCard
                  title="Murals that fit the place"
                  body="Indoor or outdoor, Joshua designs with the building, the street, and the story in mind — so the finished piece feels like it belongs there."
                />
                <AboutCard
                  title="Music-led creativity"
                  body="New ideas often start as a sound. The music he listens to and plays shapes the mood, movement, and energy of the work."
                />
                <AboutCard
                  title="Built, not just painted"
                  body="From creative installs to light carpentry, the process is hands-on — with the same attention to detail as the artwork itself."
                />
                <AboutCard
                  title="Community first"
                  body="The goal is always the same: create something the community is proud of, and help put local spots on the map."
                />
              </div>

              <div className="mt-6 rounded-lg border bg-gray-50 p-5">
                <p className="text-sm text-gray-700">
                  Want this even more personal? Add 2–3 standout projects (location + what
                  made them special) and I’ll weave them into the story.
                </p>
              </div>
            </div>
          </div>
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
