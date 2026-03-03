"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Fit = "men" | "women";
type TeeColor = { name: string; hex: string };

type TeeProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  fits: Fit[];
  sizes: string[];
  colors: TeeColor[];
  active?: boolean;
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

function tiedyeClass() {
  return "bg-[conic-gradient(at_50%_50%,#22c55e,#3b82f6,#ec4899,#a855f7,#f59e0b,#22c55e)]";
}

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
    // ✅ Treat missing as active (only false disables)
    active: data?.active !== false,
  };
}

export default function TeeDetailPage() {
  const params = useParams();

  const id = useMemo(() => {
    const raw = (params as any)?.id;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  }, [params]);

  const [product, setProduct] = useState<TeeProduct | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  const [fit, setFit] = useState<Fit>("men");
  const [size, setSize] = useState<string>("M");
  const [color, setColor] = useState<string>("Black");
  const [qty, setQty] = useState<number>(1);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    let alive = true;

    (async () => {
      setBusy(true);
      setError("");

      try {
        if (!id) throw new Error("Missing product id in URL.");

        const ref = doc(db, "teeProducts", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) throw new Error("Product not found.");

        const p = normalizeProduct(snap.id, snap.data());

        // Optional: hide inactive products
        if (p.active === false) throw new Error("This product is not available.");

        if (!alive) return;

        setProduct(p);

        setFit((p.fits?.[0] as Fit) || "men");
        setSize(p.sizes?.[0] || "M");
        setColor(p.colors?.[0]?.name || "Black");
      } catch (e: any) {
        console.error("TEE DETAIL LOAD ERROR:", e);
        if (alive) setError(e?.message || "Failed to load product.");
      } finally {
        if (alive) setBusy(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  function addToCart() {
    if (!product) return;
    setStatus(`✅ Added: ${product.title} • ${fit} • ${size} • ${color} • Qty ${qty}`);
    window.setTimeout(() => setStatus(""), 3000);
  }

  const priceText =
    Number.isFinite(product?.price) ? product!.price.toFixed(2) : "0.00";

  if (busy) {
    return (
      <main className="min-h-screen text-white px-6 py-10">
        <p className="text-white/70">Loading…</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen text-white px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-white/70">{error || "Product not found."}</p>
          <Link
            href="/graphic-design/tshirts"
            className="text-sm underline text-white/70 hover:text-white"
          >
            Back to T-Shirts
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
      <div className="absolute inset-0 -z-10 opacity-50 [background:radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.22),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(236,72,153,0.18),transparent_48%),radial-gradient(circle_at_50%_95%,rgba(14,165,233,0.16),transparent_55%)]" />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <Link
            href="/graphic-design/tshirts"
            className="text-sm underline text-white/70 hover:text-white"
          >
            Back to T-Shirts
          </Link>

          <Link href="/" className="text-sm underline text-white/70 hover:text-white">
            Home
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            <div className="aspect-square bg-black/40">
              <img
                src={product.images?.[0] || "/hero.jpg"}
                alt={product.title || "T-shirt"}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
            <p className="mt-2 text-white/70">{product.description}</p>
            <p className="mt-4 text-xl font-semibold">${priceText}</p>

            {product.fits.length > 0 ? (
              <div className="mt-8">
                <p className="text-sm font-semibold text-white/80">Fit</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {product.fits.map((f) => (
                    <button
                      key={`${product.id}-fit-${f}`}
                      type="button"
                      onClick={() => setFit(f)}
                      className={`px-4 py-2 rounded-full border transition ${
                        fit === f
                          ? "bg-white text-black border-white"
                          : "bg-white/5 border-white/15 text-white"
                      }`}
                    >
                      {f === "men" ? "Men" : "Women"}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.sizes.length > 0 ? (
              <div className="mt-8">
                <p className="text-sm font-semibold text-white/80">Size</p>
                <div className="mt-2 grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={`${product.id}-size-${s}`}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`py-2 rounded-lg border text-sm transition ${
                        size === s
                          ? "bg-white text-black border-white"
                          : "bg-white/5 border-white/15 text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.colors.length > 0 ? (
              <div className="mt-8">
                <p className="text-sm font-semibold text-white/80">Color</p>
                <div className="mt-3 flex flex-wrap gap-3 items-center">
                  {product.colors.map((c, i) => {
                    const selected = color === c.name;
                    const isTie = c.hex === "tiedye";
                    return (
                      <button
                        key={`${product.id}-color-${c.name}-${i}`}
                        type="button"
                        onClick={() => setColor(c.name)}
                        className={`h-10 w-10 rounded-full ring-2 transition ${
                          selected ? "ring-white" : "ring-white/10 hover:ring-white/30"
                        } ${isTie ? tiedyeClass() : ""}`}
                        style={!isTie ? { backgroundColor: c.hex } : undefined}
                        title={c.name}
                        aria-label={c.name}
                      />
                    );
                  })}

                  <span className="text-sm text-white/70 ml-2">
                    Selected: <span className="font-semibold text-white">{color}</span>
                  </span>
                </div>
              </div>
            ) : null}

            <div className="mt-10 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
                >
                  −
                </button>
                <div className="min-w-[3rem] text-center">{qty}</div>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="h-10 w-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={addToCart}
                className="rounded-lg bg-white text-black px-5 py-3 text-sm font-semibold hover:bg-white/90"
              >
                Add to Cart
              </button>

              {status ? <p className="text-sm text-white/80">{status}</p> : null}
            </div>

            <p className="mt-6 text-xs text-white/50">
              Shipping handled by the shopper • Local pickup available
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}