import SoftPageShell from "@/components/SoftPageShell";
import { getAboutDoc, getCollageImages } from "@/lib/server/about";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
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
          {/* background vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />

          {/* collage */}
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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

          {/* larger floating story cards */}
          <div className="absolute inset-0">
            {about.blocks?.map((b, i) => {
              const left = clamp(b.x ?? 10, 3, 74);
              const top = clamp(b.y ?? 10, 4, 78);
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
        </section>
      </main>
    </SoftPageShell>
  );
}