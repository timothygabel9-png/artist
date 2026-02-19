"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPortfolioItems, PortfolioItem } from "@/lib/portfolio";

type FilterType = "all" | "mural" | "carpentry";
type FilterCategory = "all" | "indoor" | "outdoor";

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [type, setType] = useState<FilterType>("all");
  const [category, setCategory] = useState<FilterCategory>("all");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getPortfolioItems(100);
        setItems(data);
      } catch (e: any) {
        setErr(e?.message || "Failed to load portfolio.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const typeOk = type === "all" ? true : it.type === type;
      const catOk = category === "all" ? true : it.category === category;
      return typeOk && catOk;
    });
  }, [items, type, category]);

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-gray-700 mt-2">Murals (indoor/outdoor) and light carpentry projects.</p>
        </div>
        <Link className="underline" href="/">Home</Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Type</span>
          <select className="border rounded p-2" value={type} onChange={(e) => setType(e.target.value as FilterType)}>
            <option value="all">All</option>
            <option value="mural">Murals</option>
            <option value="carpentry">Carpentry</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Category</span>
          <select
            className="border rounded p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value as FilterCategory)}
          >
            <option value="all">All</option>
            <option value="outdoor">Outdoor</option>
            <option value="indoor">Indoor</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-gray-600">
          {loading ? "Loading…" : `${filtered.length} item(s)`}
        </div>
      </div>

      {err && <p className="mt-6 text-red-700">{err}</p>}

      {loading && !err && <p className="mt-6">Loading portfolio…</p>}

      {!loading && !err && filtered.length === 0 && (
        <p className="mt-6 text-gray-700">No items match those filters yet.</p>
      )}

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((it) => (
          <Link
            key={it.id}
            href={`/portfolio/${it.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-md transition"
          >
            <div className="aspect-[4/3] bg-gray-100">
              {/* Use plain img for simplicity */}
              {it.coverImageUrl ? (
                <img
                  src={it.coverImageUrl}
                  alt={it.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  No image
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold truncate">{it.title}</h2>
                <span className="text-xs px-2 py-1 rounded bg-gray-100">
                  {it.type === "mural" ? "Mural" : "Carpentry"}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-2">
                {it.category === "outdoor" ? "Outdoor" : "Indoor"}
                {it.tags?.length ? ` • ${it.tags.slice(0, 3).join(", ")}` : ""}
              </p>

              {it.description ? (
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">{it.description}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
