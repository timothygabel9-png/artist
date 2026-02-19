"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SoftPageShell from "@/components/SoftPageShell";

type MediaItem =
  | { id: string; type: "audio"; title: string; audioUrl: string; createdAt?: any }
  | { id: string; type: "youtube"; title: string; youtubeId: string; createdAt?: any };

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "mediaItems"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as MediaItem[]);
      } catch (e: any) {
        try {
          const snap = await getDocs(collection(db, "mediaItems"));
          setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as MediaItem[]);
        } catch (e2: any) {
          setErr(e2?.message || e?.message || "Failed to load media.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SoftPageShell
      title="Media"
      subtitle="Audio tracks, studio clips, and YouTube sessions."
      variant="mintLavender"
      maxWidth="max-w-6xl"
    >
      {loading && <p>Loading…</p>}
      {err && <p className="text-red-700">{err}</p>}
      {!loading && !err && items.length === 0 && <p className="text-gray-700">No media posted yet.</p>}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it) => (
          <div
            key={it.id}
            className="rounded-2xl border border-black/5 bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold leading-snug">{it.title}</h2>
              <span className="text-xs rounded-full border border-black/10 bg-white px-2 py-1 text-gray-700">
                {it.type === "audio" ? "Audio" : "YouTube"}
              </span>
            </div>

            {it.type === "audio" ? (
              <div className="mt-4">
                <audio className="w-full" controls preload="none">
                  <source src={it.audioUrl} />
                </audio>
              </div>
            ) : (
              <div className="mt-4">
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${it.youtubeId}`}
                    title={it.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </SoftPageShell>
  );
}
