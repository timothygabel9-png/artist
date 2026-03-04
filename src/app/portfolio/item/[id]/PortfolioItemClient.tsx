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

  // modal state
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

  if (loading) return <div className="mt-10 text-white/70">Loading…</div>;

  if (err)
    return (
      <div className="mt-10 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
        <div className="font-semibold">Error</div>
        <div className="text-sm text-white/80">{err}</div>
      </div>
    );

  if (!item) return null;

  const meta = [item.type, item.category, item.clientName, item.location].filter(Boolean).join(" • ");

  return (
    <>
      {/* HERO */}
      <section className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="relative aspect-[16/10] w-full">
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
                  className="absolute bottom-3 right-3 rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs text-white/90 hover:bg-black/70"
                >
                  View slideshow
                </button>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-5">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {item.title || "Untitled"}
            </h1>

            {meta ? <div className="mt-3 text-white/70">{meta}</div> : null}

            {item.description ? (
              <p className="mt-6 text-white/80 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            ) : (
              <p className="mt-6 text-white/60">
                No description yet.
              </p>
            )}

            {Array.isArray(item.tags) && item.tags.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 text-white/80"
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
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Gallery</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((url, i) => (
              <button
                key={url + i}
                type="button"
                onClick={() => {
                  setStartIdx(i);
                  setOpen(true);
                }}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                title="Open"
              >
                <div className="relative aspect-square">
                  <Image
                    src={url}
                    alt={`Image ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* MODAL VIEWER (only opens when clicking) */}
      <PortfolioGalleryModal
        open={open}
        onClose={() => setOpen(false)}
        id={item.id}
        title={item.title}
        description={item.description}
        coverImageUrl={item.coverImageUrl}
        imageUrls={item.imageUrls}
      />
    </>
  );
}