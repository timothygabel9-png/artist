"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PortfolioGalleryModal from "@/components/PortfolioGalleryModal";
import {
  getPortfolioItemsPaged,
  PortfolioFilters,
  PortfolioItem,
} from "@/lib/portfolio";

type Cursor = any;

type ItemType = "mural" | "carpentry" | "graphic-design" | "signage";
type IndoorOutdoor = "indoor" | "outdoor";
type GraphicDesignCategory =
  | "logos"
  | "tshirts"
  | "album-covers"
  | "show-posters"
  | "events";
type Category = IndoorOutdoor | GraphicDesignCategory;

const GRAPHIC_CATEGORIES: GraphicDesignCategory[] = [
  "logos",
  "tshirts",
  "album-covers",
  "show-posters",
  "events",
];

type Props = {
  title: string;
  subtitle?: string;

  /** Seed filters for the page (ex: { type:"graphic-design", category:"logos", active:true }) */
  initialFilters?: PortfolioFilters;

  /** If true, hide the Type dropdown and force the initialFilters.type */
  lockType?: boolean;

  /** If true, hide the Category dropdown and force the initialFilters.category */
  lockCategory?: boolean;
};

export default function PortfolioBrowser({
  title,
  subtitle,
  initialFilters,
  lockType,
  lockCategory,
}: Props) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [cursor, setCursor] = useState<Cursor | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Modal
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  // Filters
  const seededActive = initialFilters?.active ?? true;

  const [featuredOnly, setFeaturedOnly] = useState(
    Boolean(initialFilters?.featured)
  );
  const [type, setType] = useState<ItemType | "all">(
    (initialFilters?.type as any) ?? "all"
  );
  const [category, setCategory] = useState<Category | "all">(
    (initialFilters?.category as any) ?? "all"
  );
  const [location, setLocation] = useState<string | "all">(
    (initialFilters?.location as any) ?? "all"
  );
  const [clientName, setClientName] = useState<string | "all">(
    (initialFilters?.clientName as any) ?? "all"
  );
  const [tag, setTag] = useState(initialFilters?.tag ?? "");

  // Dropdown values from loaded results
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

  // Keep category valid when type changes (only when not locked)
  useEffect(() => {
    if (lockType || lockCategory) return;

    if (type === "graphic-design") return;
    if (category !== "all" && GRAPHIC_CATEGORIES.includes(category as any)) {
      setCategory("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const filters = useMemo<PortfolioFilters>(() => {
    // Always show active items unless initialFilters explicitly set active:false
    const f: PortfolioFilters = { active: seededActive };

    if (featuredOnly) f.featured = true;

    if (lockType) {
      if (initialFilters?.type) f.type = initialFilters.type;
    } else if (type !== "all") {
      f.type = type as any;
    }

    if (lockCategory) {
      if (initialFilters?.category) f.category = initialFilters.category;
    } else if (category !== "all") {
      f.category = category as any;
    }

    if (location !== "all") f.location = location;
    if (clientName !== "all") f.clientName = clientName;

    const cleanTag = tag.trim();
    if (cleanTag.length >= 2) f.tag = cleanTag;

    return f;
  }, [
    seededActive,
    featuredOnly,
    type,
    category,
    location,
    clientName,
    tag,
    lockType,
    lockCategory,
    initialFilters?.type,
    initialFilters?.category,
  ]);

  // stale request guard
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
    setFeaturedOnly(Boolean(initialFilters?.featured));
    setLocation((initialFilters?.location as any) ?? "all");
    setClientName((initialFilters?.clientName as any) ?? "all");
    setTag(initialFilters?.tag ?? "");

    if (!lockType) setType((initialFilters?.type as any) ?? "all");
    if (!lockCategory) setCategory((initialFilters?.category as any) ?? "all");
  }

  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const selectClass =
    "rounded-lg bg-slate-800/80 text-white border border-white/20 px-4 py-2 text-sm shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition";
  const inputClass =
    "rounded-lg bg-slate-800/80 text-white border border-white/20 px-4 py-2 text-sm shadow-sm backdrop-blur-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition";

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle ? <p className="text-white/70">{subtitle}</p> : null}
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

          {!lockType && (
            <select
              className={selectClass}
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option className="text-black bg-white" value="all">
                All types
              </option>
              <option className="text-black bg-white" value="mural">
                Mural
              </option>
              <option className="text-black bg-white" value="carpentry">
                Carpentry
              </option>
              <option className="text-black bg-white" value="graphic-design">
                Graphic Design
              </option>
              <option className="text-black bg-white" value="signage">
                Signage
              </option>
            </select>
          )}

          {!lockCategory && (
            <select
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option className="text-black bg-white" value="all">
                All categories
              </option>

              {type === "graphic-design" ? (
                <>
                  <option className="text-black bg-white" value="logos">
                    /graphic-design/logos
                  </option>
                  <option className="text-black bg-white" value="tshirts">
                    /graphic-design/tshirts
                  </option>
                  <option className="text-black bg-white" value="album-covers">
                    /graphic-design/album-covers
                  </option>
                  <option className="text-black bg-white" value="show-posters">
                    /graphic-design/show-posters
                  </option>
                  <option className="text-black bg-white" value="events">
                    /graphic-design/events
                  </option>
                </>
              ) : (
                <>
                  <option className="text-black bg-white" value="indoor">
                    Indoor
                  </option>
                  <option className="text-black bg-white" value="outdoor">
                    Outdoor
                  </option>
                </>
              )}
            </select>
          )}

          <select
            className={selectClass}
            value={location}
            onChange={(e) => setLocation(e.target.value as any)}
          >
            <option className="text-black bg-white" value="all">
              All locations
            </option>
            {allLocations.map((x) => (
              <option className="text-black bg-white" key={x} value={x}>
                {x}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={clientName}
            onChange={(e) => setClientName(e.target.value as any)}
          >
            <option className="text-black bg-white" value="all">
              All clients
            </option>
            {allClients.map((x) => (
              <option className="text-black bg-white" key={x} value={x}>
                {x}
              </option>
            ))}
          </select>

          <input
            className={inputClass}
            placeholder="Tag (min 2 chars)…"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-sm hover:bg-white/20 transition shadow-sm"
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
          <div className="text-white/70 mt-2">
            Try clearing filters or using a different tag.
          </div>
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
                  {/* Image area links to project page; does NOT open modal */}
                  <div className="relative h-52 w-full bg-white/5">
                    <Link
                      href={`/portfolio/item/${it.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0"
                      aria-label={`Open ${it.title || "project"}`}
                      title="Open project page"
                    >
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
                    </Link>
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
                      {[it.type, it.category, it.clientName, it.location]
                        .filter(Boolean)
                        .join(" • ")}
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

      <PortfolioGalleryModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        id={selected?.id} // ✅ NEW: enables "View Project →" inside the modal
        title={selected?.title}
        description={selected?.description}
        coverImageUrl={selected?.coverImageUrl}
        imageUrls={selected?.imageUrls}
      />
    </div>
  );
}