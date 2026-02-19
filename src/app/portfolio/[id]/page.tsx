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
    (async () => {
      try {
        setErr("");
        setLoading(true);

        if (!id || typeof id !== "string") {
          setErr("Missing portfolio id in URL.");
          setItem(null);
          return;
        }

        const data = await getPortfolioItemById(id);

        if (!data) {
          setErr("Not found.");
          setItem(null);
          return;
        }

        setItem(data);
      } catch (e: any) {
        setErr(e?.message || "Failed to load.");
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
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
    item.imageUrls?.length ? item.imageUrls : item.coverImageUrl ? [item.coverImageUrl] : [];

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

      <h1 className="text-3xl font-bold mt-6">{item.title}</h1>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="px-2 py-1 rounded bg-gray-100">
          {item.type === "mural" ? "Mural" : "Carpentry"}
        </span>
        <span className="px-2 py-1 rounded bg-gray-100">
          {item.category === "outdoor" ? "Outdoor" : "Indoor"}
        </span>
        {item.tags?.map((t) => (
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
            <div key={idx} className="border rounded-lg overflow-hidden bg-gray-100">
              <img
                src={url}
                alt={`${item.title} image ${idx + 1}`}
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
