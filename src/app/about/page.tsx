import SoftPageShell from "@/components/SoftPageShell";
import { getAboutDoc, getCollageImages } from "@/lib/server/about";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 1.8h8.5c2.18 0 3.95 1.77 3.95 3.95v8.5c0 2.18-1.77 3.95-3.95 3.95h-8.5c-2.18 0-3.95-1.77-3.95-3.95v-8.5c0-2.18 1.77-3.95 3.95-3.95zm9.65 1.35a1.05 1.05 0 100 2.1 1.05 1.05 0 000-2.1zM12 7.3A4.7 4.7 0 107.3 12 4.705 4.705 0 0012 7.3zm0 1.8A2.9 2.9 0 119.1 12 2.903 2.903 0 0112 9.1z" />
    </svg>
  );
}

function InstagramFollowSection() {
  return (
    <div className="pointer-events-auto">
      <div className="mx-auto max-w-md text-center">
        <div className="relative px-4 py-3 text-white">
          {/* soft glow only, no visible outer card */}
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute left-1/2 top-1/2 h-28 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/6 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-24 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/8 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-24 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/8 blur-3xl" />
          </div>

          <div className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
            Follow the Artist
          </div>

          <h2 className="relative z-10 mt-2 text-xl font-semibold tracking-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)]">
            Stay connected on Instagram
          </h2>

          <p className="relative z-10 mt-2 text-sm leading-relaxed text-red/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            See murals, sketches, works in progress, and new finished pieces from Joshua Schultz.
          </p>

          <a
            href="https://www.instagram.com/joshuatschultz/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Joshua Schultz on Instagram"
            className="relative z-10 mt-4 inline-flex items-center gap-3 rounded-full border border-white/12 bg-black/8 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition duration-300 hover:-translate-y-[1px] hover:border-white/20 hover:bg-white/12"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
              <InstagramIcon className="h-4 w-4" />
            </span>
            <span>Follow @joshuatschultz</span>
          </a>

          <div className="relative z-10 mt-3 text-xs tracking-[0.14em] text-white/35">
            @joshuatschultz
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AboutPage() {
  const about = await getAboutDoc();
  const images = await getCollageImages(18);

  return (
    <SoftPageShell
      title={about.title || "About"}
      subtitle={about.subtitle || "The story behind the work"}
      variant="oceanNoir"
    >
      <main className="mx-auto w-full max-w-[1600px] px-3 py-4 text-white sm:px-4 sm:py-6 lg:px-6">
        {/* DESKTOP / TABLET FULL-SCREEN COLLAGE */}
        <section className="relative hidden min-h-[calc(100svh-7rem)] overflow-hidden rounded-3xl border border-white/10 bg-black/30 md:block">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />

          <div className="absolute inset-0 p-3 sm:p-4 lg:p-5">
            <div className="grid h-full auto-rows-[90px] grid-cols-12 gap-3 lg:auto-rows-[110px] lg:gap-4">
              {images.slice(0, 18).map((src, i) => {
                const layouts = [
                  "col-span-4 row-span-3",
                  "col-span-3 row-span-2",
                  "col-span-5 row-span-4",
                  "col-span-4 row-span-3",
                  "col-span-3 row-span-3",
                  "col-span-5 row-span-2",
                  "col-span-4 row-span-4",
                  "col-span-4 row-span-2",
                  "col-span-4 row-span-3",
                  "col-span-3 row-span-2",
                  "col-span-5 row-span-3",
                  "col-span-4 row-span-2",
                ];

                const floaters = [
                  "animate-floatSlow",
                  "animate-floatSlow2",
                  "animate-floatSlow3",
                ];

                return (
                  <div
                    key={`${src}-${i}`}
                    className={[
                      "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.28)]",
                      layouts[i % layouts.length],
                      floaters[i % floaters.length],
                    ].join(" ")}
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/18" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute inset-x-0 top-0 bottom-88">
            {about.blocks?.map((b, i) => {
              const left = clamp(b.x ?? 10, 3, 74);
              const top = clamp(b.y ?? 10, 4, 46);
              const w = clamp(b.w ?? 520, 340, 760);

              return (
                <div
                  key={b.id}
                  className={[
                    "absolute rounded-3xl border border-white/15 bg-black/55 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md lg:p-8",
                    i % 2 === 0 ? "animate-cardDriftA" : "animate-cardDriftB",
                  ].join(" ")}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${w}px`,
                  }}
                >
                  {b.heading ? (
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75 lg:text-sm">
                      {b.heading}
                    </div>
                  ) : null}

                  <div
                    className={[
                      "mt-3 text-base leading-relaxed text-white/92 lg:text-lg xl:text-xl",
                      b.align === "center"
                        ? "text-center"
                        : b.align === "right"
                        ? "text-right"
                        : "text-left",
                    ].join(" ")}
                  >
                    {b.body}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-black/45 to-transparent" />

          <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex justify-center px-6">
            <InstagramFollowSection />
          </div>
        </section>

        {/* MOBILE VERSION */}
        <section className="md:hidden">
          <div className="grid grid-cols-2 gap-3">
            {images.slice(0, 8).map((src, i) => (
              <div
                key={`${src}-${i}`}
                className={[
                  "overflow-hidden rounded-2xl border border-white/10 bg-white/5",
                  i % 3 === 0 ? "aspect-[4/5]" : "aspect-square",
                ].join(" ")}
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {about.blocks?.length ? (
            <div className="mt-6 space-y-4">
              {about.blocks.map((b) => (
                <div
                  key={b.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6"
                >
                  {b.heading ? (
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75 sm:text-sm">
                      {b.heading}
                    </div>
                  ) : null}
                  <p className="mt-3 text-base leading-relaxed text-white/90 sm:text-lg">
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-6">
            <InstagramFollowSection />
          </div>
        </section>
      </main>
    </SoftPageShell>
  );
}