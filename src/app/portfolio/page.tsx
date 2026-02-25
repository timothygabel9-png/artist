"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SoftPageShell from "@/components/SoftPageShell";
import { getPortfolioItems, PortfolioItem } from "@/lib/portfolio";

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getPortfolioItems(100);
        if (mounted) setItems(data);
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load portfolio.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SoftPageShell variant="oceanNoir">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="mt-2 text-white/70">Latest projects.</p>
          </div>

          <Link className="underline text-white/80 hover:text-white" href="/">
            Home
          </Link>
        </div>

        {loading && <p className="mt-6 text-white/70">Loading…</p>}
        {err && <p className="mt-6 text-red-300">{err}</p>}

        {!loading && !err && items.length === 0 && (
          <p className="mt-6 text-white/70">
            No portfolio items yet. Add one in{" "}
            <Link className="underline" href="/admin/portfolio">
              /admin/portfolio
            </Link>
            .
          </p>
        )}

        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items
            .filter((it) => typeof it.id === "string" && it.id.length > 0)
            .map((it) => (
              <Link
                key={it.id}
                href={`/portfolio/${it.id}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
              >
                <div className="aspect-[4/3] bg-white/5">
                  {it.coverImageUrl ? (
                    <img
                      src={it.coverImageUrl}
                      alt={it.title || "Portfolio item"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="truncate font-semibold">
                    {it.title || "Untitled"}
                  </h2>
                  <p className="mt-2 text-sm text-white/70">
                    {(it.type || "project")} • {(it.category || "category")}
                  </p>
                </div>
              </Link>
            ))}
        </section>
      </main>
    </SoftPageShell>
  );
}