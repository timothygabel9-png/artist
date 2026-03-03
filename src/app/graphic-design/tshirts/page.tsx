// src/app/graphic-design/tshirts/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type TeeColor = { name: string; hex: string };
type TeeProduct = {
  id: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
  fits: ("men" | "women")[];
  sizes: string[];
  colors: TeeColor[];
  active?: boolean;
  createdAt?: any;
};

const FALLBACK_COLORS: TeeColor[] = [
  { name: "White", hex: "#ffffff" },
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Black", hex: "#111827" },
  { name: "Green", hex: "#22c55e" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Tie Dye", hex: "tiedye" },
];

function normalizeProduct(id: string, data: any): TeeProduct {
  const colors =
    Array.isArray(data?.colors) && data.colors.length
      ? data.colors.filter((c: any) => c?.name && c?.hex)
      : FALLBACK_COLORS;

  return {
    id,
    title: String(data?.title ?? "Untitled"),
    description: String(data?.description ?? ""),
    price: Number(data?.price ?? 0),
    images: Array.isArray(data?.images) ? data.images.filter(Boolean) : [],
    fits: Array.isArray(data?.fits) ? data.fits : [],
    sizes: Array.isArray(data?.sizes) ? data.sizes : [],
    colors,
    active: Boolean(data?.active),
    createdAt: data?.createdAt,
  };
}

export default function TshirtsPage() {
  const [items, setItems] = useState<TeeProduct[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setBusy(true);
      setError("");

      try {
        const q = query(
          collection(db, "teeProducts"),
          where("active", "==", true),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const list = snap.docs.map((d) => normalizeProduct(d.id, d.data()));

        if (alive) setItems(list);
      } catch (e: any) {
        console.error("TEE LOAD ERROR:", e);
        if (alive) setError(e?.message || "Failed to load tshirts.");
      } finally {
        if (alive) setBusy(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const hasItems = useMemo(() => items.length > 0, [items]);

  return (
    <main className="min-h-screen text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
      <div className="absolute inset-0 -z-10 opacity-50 [background:radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.22),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(236,72,153,0.18),transparent_48%),radial-gradient(circle_at_50%_95%,rgba(14,165,233,0.16),transparent_55%)]" />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Graphic Tees</h1>
            <p className="mt-2 text-white/70">
              Wearable art — fresh runs, limited drops, and hometown energy.
            </p>
          </div>
          <Link href="/" className="text-sm underline text-white/70 hover:text-white">
            Home
          </Link>
        </div>

        <div className="mt-8">
          {busy ? <p className="text-white/70">Loading tees…</p> : null}

          {!busy && error ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/80">Couldn’t load tees.</p>
              <p className="mt-1 text-xs text-white/60 break-words">{error}</p>
            </div>
          ) : null}

          {!busy && !error && !hasItems ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-white/80">No tees posted yet.</p>
              <p className="mt-2 text-sm text-white/60">
                Add a tee in Admin and make sure <code>active</code> is checked.
              </p>
            </div>
          ) : null}

          {!busy && !error && hasItems ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((p) => {
                const colors = (p.colors?.length ? p.colors : FALLBACK_COLORS).slice(0, 6);
                return (
                  <Link
                    key={p.id}
                    href={`/graphic-design/tshirts/${p.id}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] bg-black/30">
                      <Image
                        src={p.images?.[0] || "/hero.jpg"}
                        alt={p.title || "T-shirt"}
                        fill
                        className="object-cover opacity-90 group-hover:opacity-100 transition"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-semibold">{p.title}</h2>
                        <span className="text-sm text-white/80">
                          ${Number.isFinite(p.price) ? p.price : 0}
                        </span>
                      </div>

                      {p.description ? (
                        <p className="mt-2 text-sm text-white/70 line-clamp-2">{p.description}</p>
                      ) : (
                        <p className="mt-2 text-sm text-white/50 italic">No description yet.</p>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex -space-x-1">
                          {colors.map((c, i) => (
                            <span
                              key={`${p.id}-${c.name}-${i}`}
                              title={c.name}
                              className={`h-5 w-5 rounded-full ring-1 ring-white/15 ${c.hex === "tiedye" ? "bg-[conic-gradient(at_50%_50%,#22c55e,#3b82f6,#ec4899,#a855f7,#f59e0b,#22c55e)]" : ""}`}
                              style={c.hex !== "tiedye" ? { backgroundColor: c.hex } : undefined}
                            />
                          ))}
                        </div>

                        <span className="text-xs text-white/60">
                          {p.fits?.includes("men") ? "Men" : ""}
                          {p.fits?.includes("men") && p.fits?.includes("women") ? " + " : ""}
                          {p.fits?.includes("women") ? "Women" : ""}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}