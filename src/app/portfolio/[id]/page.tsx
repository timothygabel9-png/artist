"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPortfolioItemById, PortfolioItem } from "@/lib/portfolio";

export default function PortfolioDetailPage() {
  const params = useParams<{ id?: string }>();
  const id = params?.id;

  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setErr("");
        setLoading(true);
        setItem(null);

        if (!id || typeof id !== "string") {
          setErr("Missing portfolio id in URL.");
          return;
        }

        const data = await getPortfolioItemById(id);

        if (cancelled) return;

        if (!data) {
          setErr("Not found.");
          return;
        }

        setItem(data);
      } catch (e: any) {
        if (cancelled) return;

        const msg = e?.message || "Failed to load.";

        // Firestore often throws "Missing or insufficient permissions."
        if (msg.toLowerCase().includes("insufficient permissions")) {
          setErr("This item is not available.");
        } else {
          setErr(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="p-8">Loading…</div>;

  if (err) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <p className="text-red-700">{err}</p>
        <Link className="underline" href="/portfolio">
          Back to Portfolio
        </Link>
      </div>
    );
  }

  if (!item) return null;

  const images =
    item.imageUrls?.length
      ? item.imageUrls
      : item.coverImageUrl
      ? [item.coverImageUrl]
      : [];

  const typeLabel =
    item.type === "mural" ? "Mural" : item.type === "carpentry" ? "Carpentry" : "Work";

  const categoryLabel =
    item.category === "outdoor" ? "Outdoor" : item.category === "indoor" ? "Indoor" : "Location";

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link className="underline" href="/portfolio">
          ← Back
        </Link>
        <Link className="underline" href="/">
          Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mt-6">{item.title || "Untitled"}</h1>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="px-2 py-1 rounded bg-gray-100">{typeLabel}</span>
        <span className="px-2 py-1 rounded bg-gray-100">{categoryLabel}</span>

        {Array.isArray(item.tags) &&
          item.tags.map((t) => (
            <span key={t} className="px-2 py-1 rounded bg-gray-100">
              {t}
            </span>
          ))}
      </div>

      {item.description ? (
        <p className="mt-4 text-gray-800 whitespace-pre-wrap">{item.description}</p>
      ) : null}

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {images.length ? (
          images.map((url, idx) => (
            <div key={url + idx} className="border rounded-lg overflow-hidden bg-gray-100">
              <img
                src={url}
                alt={`${item.title || "Portfolio"} image ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))
        ) : (
          <div className="text-gray-600">No images yet.</div>
        )}
      </section>
    </main>
  );
}