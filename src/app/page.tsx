import HeroRotator, { HeroSlide } from "@/components/HeroRotator";

const heroSlides: HeroSlide[] = [
  {
    src: "/hero/1.jpg",
    alt: "Hero image 1",
    kicker: "Murals • Graphic Design • Studio Work",
    title: "Joshua Schultz",
    signature: true,
    blurb: "Work that fits the space and the story, built to feel like it belongs there.",
  },
  {
    src: "/hero/2.jpg",
    alt: "Hero image 2",
    kicker: "Community • Craft • Color",
    title: "Joshua Schultz",
    signature: true,
    blurb: "Original designs that expands the mind",
  },
  {
    src: "/hero/3.jpg",
    alt: "Hero image 3",
    kicker: "Indoor / Outdoor",
    title: "Joshua Schultz",
    signature: true,
    blurb: "Built not just painted, illustrations that can make one think.",
  },
  {
    src: "/hero/4.jpg",
    alt: "Hero image 4",
    kicker: "Indoor / Outdoor",
    title: "Joshua Schultz",
    signature: true,
    blurb: "Outdoor work for any situation or institute.",
  },
  {
    src: "/hero/5.jpg",
    alt: "Hero image 5",
    kicker: "Indoor / Outdoor",
    title: "Joshua Schultz",
    signature: true,
    blurb: "Working together to brighten up communities and expand brands.",
  },
  {
    src: "/hero/6.jpg",
    alt: "Hero image 6",
    kicker: "Indoor / Outdoor",
    title: "Joshua Schultz",
    signature: true,
    blurb: "Creating spaces that people will remember",
  },
  {
    src: "/hero/8.jpg",
    alt: "Hero image 8",
    kicker: "Indoor / Outdoor",
    title: "Joshua Schultz",
    signature: true,
    blurb: "Bringing energy to the communities from Aurora and beyond",
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden">
      <section className="min-h-[calc(100svh-4rem)]">
        <HeroRotator
          slides={heroSlides}
          intervalMs={11000}
          fadeMs={2600}
          className="min-h-[calc(100svh-4rem)]"
        />
      </section>
    </main>
  );
}