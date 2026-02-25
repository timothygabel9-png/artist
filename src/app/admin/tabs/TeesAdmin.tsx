"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { hardDeleteTeeProduct } from "@/lib/adminActions";
import { Row, Button } from "./AdminUI";
import Link from "next/link";

type Item = { id: string; title?: string; active?: boolean; price?: number };

export default function TeesAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "teeProducts"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
  }, []);

  return (
    <div>
<div className="flex flex-wrap items-center justify-between gap-3">
  <div>
    <h2 className="text-lg font-semibold">Tees</h2>
    <p className="mt-1 text-sm text-white/60">
      Remove = <b>soft delete</b> (sets{" "}
      <code className="text-white/80">active:false</code>)
    </p>
  </div>

  <Link
    href="/admin/tees"
    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
  >
    Upload / Edit
  </Link>
</div>

<div className="mt-5 grid gap-3">
        {loading && <div className="text-sm text-white/60">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="text-sm text-white/60">No products found.</div>
        )}

        {items.map((it) => (
          <Row
            key={it.id}
            title={it.title || "Untitled tee"}
            subtitle={`active: ${String(it.active)}${it.price != null ? ` • $${it.price}` : ""}`}
            right={
              <Button
                variant="danger"
                onClick={async () => {
                  if (!confirm("Permanently delete this tee product?")) return;
                  await hardDeleteTeeProduct(it.id);
                }}
              >
                Remove (Delete)
              </Button>
            }
          />
        ))}
      </div>
    </div>
  );
}