"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPortfolioItems, PortfolioItem } from "@/lib/portfolio";

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-gray-700 mt-2">Latest projects.</p>
        </div>
        <Link className="underline" href="/">Home</Link>
      </div>

      {loading && <p className="mt-6">Loading…</p>}
      {err && <p className="mt-6 text-red-700">{err}</p>}

      {!loading && !err && items.length === 0 && (
        <p className="mt-6 text-gray-700">
          No portfolio items yet. Add one in{" "}
          <Link className="underline" href="/admin/portfolio">/admin/portfolio</Link>.
        </p>
      )}

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items
          .filter((it) => typeof it.id === "string" && it.id.length > 0)
          .map((it) => (
            <Link
              key={it.id}
              href={`/portfolio/${it.id}`}
              className="border rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-[4/3] bg-gray-100">
                {it.coverImageUrl ? (
                  <img
                    src={it.coverImageUrl}
                    alt={it.title || "Portfolio item"}
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
                <h2 className="font-semibold truncate">{it.title || "Untitled"}</h2>
                <p className="text-sm text-gray-600 mt-2">
                  {(it.type || "project")} • {(it.category || "category")}
                </p>
              </div>
            </Link>
          ))}
      </section>
    </main>
  );
}
