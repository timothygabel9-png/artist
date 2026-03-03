"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SoftPageShell from "@/components/SoftPageShell";
import { getPortfolioItemsPaged, PortfolioItem, PortfolioFilters } from "@/lib/portfolio";
import Image from "next/image";
import PortfolioGalleryModal from "@/components/PortfolioGalleryModal";

type Cursor = any; // Firestore QueryDocumentSnapshot type (kept as any in client state)

type ItemType = "mural" | "carpentry" | "graphic-design" | "signage";
type IndoorOutdoor = "indoor" | "outdoor";
type GraphicDesignCategory = "logos" | "tshirts" | "album-covers" | "show-posters" | "events";
type Category = IndoorOutdoor | GraphicDesignCategory;

const GRAPHIC_CATEGORIES: GraphicDesignCategory[] = [
  "logos",
  "tshirts",
  "album-covers",
  "show-posters",
  "events",
];

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [cursor, setCursor] = useState<Cursor | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Modal
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  // Filters
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [type, setType] = useState<ItemType | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");

  const [location, setLocation] = useState<string | "all">("all");
  const [clientName, setClientName] = useState<string | "all">("all");

  const [tag, setTag] = useState("");

  // Dropdown values built from currently loaded results
  const allLocations = useMemo(() => {
    const s = new Set<string>();
    for (const it of items as any[]) {
      const v = (it?.location || "").trim();
      if (v) s.add(v);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const allClients = useMemo(() => {
    const s = new Set<string>();
    for (const it of items as any[]) {
      const v = (it?.clientName || "").trim();
      if (v) s.add(v);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [items]);

  // If user switches away from graphic-design but category is a graphic category, reset it
  useEffect(() => {
    if (type === "graphic-design") return;
    if (category !== "all" && GRAPHIC_CATEGORIES.includes(category as any)) {
      setCategory("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const filters = useMemo<PortfolioFilters>(() => {
    // Always show active items on the public page
    const f: PortfolioFilters = { active: true };

    if (featuredOnly) f.featured = true;
    if (type !== "all") f.type = type as any;
    if (category !== "all") f.category = category as any;

    if (location !== "all") f.location = location;
    if (clientName !== "all") f.clientName = clientName;

    const cleanTag = tag.trim();
    if (cleanTag.length >= 2) f.tag = cleanTag; // avoid useless queries

    return f;
  }, [featuredOnly, type, category, location, clientName, tag]);

  // prevents stale requests from overwriting state
  const requestIdRef = useRef(0);

  async function loadFirstPage() {
    const reqId = ++requestIdRef.current;
    setLoading(true);
    setErr(null);
    setCursor(null);
    setHasMore(false);

    try {
      const res = await getPortfolioItemsPaged({
        pageSize: 24,
        cursor: null,
        filters,
      });
      if (reqId !== requestIdRef.current) return;

      setItems(res.items);
      setCursor(res.nextCursor);
      setHasMore(Boolean(res.nextCursor));
    } catch (e: any) {
      if (reqId !== requestIdRef.current) return;
      setErr(e?.message || "Failed to load portfolio.");
      setItems([]);
      setCursor(null);
      setHasMore(false);
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }

  async function loadMore() {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    setErr(null);

    try {
      const res = await getPortfolioItemsPaged({
        pageSize: 24,
        cursor,
        filters,
      });

      // append, de-dupe by id just in case
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const it of res.items) if (!seen.has(it.id)) merged.push(it);
        return merged;
      });

      setCursor(res.nextCursor);
      setHasMore(Boolean(res.nextCursor));
    } catch (e: any) {
      setErr(e?.message || "Failed to load more items.");
    } finally {
      setLoadingMore(false);
    }
  }

  function clearFilters() {
    setFeaturedOnly(false);
    setType("all");
    setCategory("all");
    setLocation("all");
    setClientName("all");
    setTag("");
  }

  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <SoftPageShell variant="oceanNoir">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-white/70">Murals, carpentry, graphic design, signage, and featured work.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
              />
              Featured
            </label>

            <select
              className="rounded-lg bg-slate-800/80 text-white border border-white/20 px-4 py-2 text-sm shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="all">All types</option>
              <option value="mural">Mural</option>
              <option value="carpentry">Carpentry</option>
              <option value="graphic-design">Graphic Design</option>
              <option value="signage">Signage</option>
            </select>

            <select
              className="rounded-lg bg-slate-800/80 text-white border border-white/20 px-4 py-2 text-sm shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="all">All categories</option>

              {type === "graphic-design" ? (
                <>
                  <option value="logos">/graphic-design/logos</option>
                  <option value="tshirts">/graphic-design/tshirts</option>
                  <option value="album-covers">/graphic-design/album-covers</option>
                  <option value="show-posters">/graphic-design/show-posters</option>
                  <option value="events">/graphic-design/events</option>
                </>
              ) : (
                <>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </>
              )}
            </select>

            <select
              className="rounded-lg bg-slate-800/80 text-white border border-white/20 px-4 py-2 text-sm shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition"
              value={location}
              onChange={(e) => setLocation(e.target.value as any)}
              title="Location"
            >
              <option value="all">All locations</option>
              {allLocations.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg bg-slate-800/80 text-white border border-white/20 px-4 py-2 text-sm shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition"
              value={clientName}
              onChange={(e) => setClientName(e.target.value as any)}
              title="Client"
            >
              <option value="all">All clients</option>
              {allClients.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <input
              className="rounded-lg bg-slate-800/80 text-white border border-white/20 px-4 py-2 text-sm shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition"
              placeholder="Tag (min 2 chars)…"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md bg-white/10 border border-white/15 px-3 py-2 text-sm hover:bg-white/15"
            >
              Clear
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-6 rounded-lg bg-red-500/15 border border-red-400/30 p-4">
            <div className="font-semibold">Error</div>
            <div className="text-white/80 text-sm">{err}</div>
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/10 border border-white/10 p-4 animate-pulse"
              >
                <div className="h-44 rounded-xl bg-white/10" />
                <div className="mt-4 h-4 w-2/3 rounded bg-white/10" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
            <div className="text-xl font-semibold">No results</div>
            <div className="text-white/70 mt-2">Try clearing filters or using a different tag.</div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((it: any) => (
                <button
                  key={it.id}
                  onClick={() => setSelected(it)}
                  className="text-left rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition"
                >
                  <article>
                    <div className="relative h-52 w-full bg-white/5">
                      {it.coverImageUrl ? (
                        <Image
                          src={it.coverImageUrl}
                          alt={it.title || "Portfolio item"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-semibold text-lg truncate">
                          {it.title || "Untitled"}
                        </h2>
                        {it.featured ? (
                          <span className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10">
                            Featured
                          </span>
                        ) : null}
                      </div>

                      <div className="text-sm text-white/70 mt-1">
                        {[it.type, it.category, it.clientName, it.location].filter(Boolean).join(" • ")}
                      </div>

                      {it.description ? (
                        <p className="text-sm text-white/75 mt-3 line-clamp-3">
                          {it.description}
                        </p>
                      ) : null}

                      {Array.isArray(it.tags) && it.tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {it.tags.slice(0, 4).map((t: string) => (
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
                  </article>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              {hasMore ? (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-xl bg-white/10 border border-white/15 px-5 py-3 hover:bg-white/15 disabled:opacity-60"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              ) : (
                <div className="text-white/60 text-sm">End of results</div>
              )}
            </div>
          </>
        )}

        {/* Modal */}
        <PortfolioGalleryModal
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          title={selected?.title}
          description={selected?.description}
          coverImageUrl={selected?.coverImageUrl}
          imageUrls={selected?.imageUrls}
        />
      </main>
    </SoftPageShell>
  );
}