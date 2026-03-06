"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import PortfolioGalleryModal from "@/components/PortfolioGalleryModal";
import { getPortfolioItemById, PortfolioItem } from "@/lib/portfolio";

function uniq(arr: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const x = (s || "").trim();
    if (!x) continue;
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

export default function PortfolioItemClient({ id }: { id: string }) {
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [startIdx, setStartIdx] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await getPortfolioItemById(id);
        if (!res) {
          setItem(null);
          setErr("Item not found");
          return;
        }
        setItem(res);
      } catch (e: any) {
        setErr(e?.message || "Failed to load item.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const images = useMemo(() => {
    if (!item) return [];
    const merged = [item.coverImageUrl, ...(item.imageUrls || [])].filter(Boolean) as string[];
    return uniq(merged);
  }, [item]);

  const cover = images[0];

  if (loading) {
    return <div className="mt-8 text-sm text-white/70 sm:mt-10">Loading…</div>;
  }

  if (err) {
    return (
      <div className="mt-8 rounded-xl border border-red-400/30 bg-red-500/10 p-4 sm:mt-10">
        <div className="font-semibold">Error</div>
        <div className="text-sm text-white/80">{err}</div>
      </div>
    );
  }

  if (!item) return null;

  const meta = [item.type, item.category, item.clientName, item.location]
    .filter(Boolean)
    .join(" • ");

  return (
    <>
      {/* HERO */}
      <section className="mt-6 sm:mt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-start">
          <div className="lg:col-span-7">
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
                {cover ? (
                  <Image
                    src={cover}
                    alt={item.title || "Portfolio item"}
                    fill
                    className="object-contain bg-black"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/50">
                    No image
                  </div>
                )}
              </div>

              {images.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStartIdx(0);
                    setOpen(true);
                  }}
                  className="absolute bottom-3 right-3 min-h-[40px] rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs text-white/90 transition hover:bg-black/75 sm:text-sm"
                >
                  View Slideshow
                </button>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {item.title || "Untitled"}
            </h1>

            {meta ? (
              <div className="mt-3 text-sm text-white/70 sm:text-base">{meta}</div>
            ) : null}

            {item.description ? (
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-white/80 sm:mt-6 sm:text-base">
                {item.description}
              </p>
            ) : (
              <p className="mt-5 text-sm text-white/60 sm:mt-6 sm:text-base">
                No description yet.
              </p>
            )}

            {Array.isArray(item.tags) && item.tags.length ? (
              <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* GALLERY GRID */}
      {images.length > 1 ? (
        <section className="mt-10 sm:mt-12">
          <h2 className="text-lg font-semibold sm:text-xl">Gallery</h2>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((url, i) => (
              <button
                key={url + i}
                type="button"
                onClick={() => {
                  setStartIdx(i);
                  setOpen(true);
                }}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                title="Open"
              >
                <div className="relative aspect-square">
                  <Image
                    src={url}
                    alt={`Image ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

<PortfolioGalleryModal
  open={open}
  onClose={() => setOpen(false)}
  id={item.id}
  title={item.title}
  description={item.description}
  coverImageUrl={item.coverImageUrl}
  imageUrls={item.imageUrls}
  initialIndex={startIdx}
/>
    </>
  );
}