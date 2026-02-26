"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SoftPageShell from "@/components/SoftPageShell";

type MediaType = "audio" | "youtube";

type MediaItem = {
  id: string;
  type: MediaType;
  title: string;
  audioUrl?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  createdAt?: any;
  active?: boolean;
};

const panel =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.04)]";

function extractYouTubeId(raw: string): string {
  const s = (raw || "").trim();
  if (!s) return "";

  // Accept plain ID
  if (/^[a-zA-Z0-9_-]{6,}$/.test(s) && !s.includes("http")) return s;

  // URLs
  const m1 = s.match(/[?&]v=([^&]+)/);
  if (m1?.[1]) return m1[1];

  const m2 = s.match(/youtu\.be\/([^?&]+)/);
  if (m2?.[1]) return m2[1];

  const m3 = s.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (m3?.[1]) return m3[1];

  const m4 = s.match(/youtube\.com\/embed\/([^?&]+)/);
  if (m4?.[1]) return m4[1];

  return "";
}

function normalize(id: string, data: any): MediaItem {
  const type = (data?.type === "youtube" ? "youtube" : "audio") as MediaType;

  const title = String(data?.title ?? "Untitled");

  const audioUrl = typeof data?.audioUrl === "string" ? data.audioUrl : "";
  const youtubeId =
    typeof data?.youtubeId === "string" ? data.youtubeId : "";
  const youtubeUrl =
    typeof data?.youtubeUrl === "string" ? data.youtubeUrl : "";

  const resolvedYouTubeId =
    youtubeId || extractYouTubeId(youtubeUrl) || "";

  return {
    id,
    type,
    title,
    audioUrl: audioUrl || undefined,
    youtubeId: resolvedYouTubeId || undefined,
    youtubeUrl: youtubeUrl || undefined,
    createdAt: data?.createdAt,
    active: typeof data?.active === "boolean" ? data.active : undefined,
  };
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  // Optional filter: show active only if field exists.
  // If you don't use "active", you can remove the where() and it will just show everything.
  useEffect(() => {
    let alive = true;

    async function load() {
      setBusy(true);
      setError("");

      try {
        // Try: active == true first (best practice for public pages).
        // If your docs don't have "active", Firestore will return 0 docs (not an error).
        // If you want EVERYTHING regardless, remove the where().
        const q = query(
          collection(db, "mediaItems"),
          where("active", "==", true),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const list = snap.docs.map((d) => normalize(d.id, d.data()));
        if (alive) setItems(list);
      } catch (e: any) {
        console.error("MEDIA LOAD ERROR:", e);

        // Fallback: if active/index causes issues, try without where()
        try {
          const q2 = query(
            collection(db, "mediaItems"),
            orderBy("createdAt", "desc")
          );
          const snap2 = await getDocs(q2);
          const list2 = snap2.docs.map((d) => normalize(d.id, d.data()));
          if (alive) setItems(list2);
        } catch (e2: any) {
          console.error("MEDIA LOAD FALLBACK ERROR:", e2);
          if (alive) setError(e2?.message || e?.message || "Failed to load media.");
        }
      } finally {
        if (alive) setBusy(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const audioItems = useMemo(() => items.filter((i) => i.type === "audio"), [items]);
  const youtubeItems = useMemo(() => items.filter((i) => i.type === "youtube"), [items]);

  return (
    <SoftPageShell title="Media" variant="oceanNoir">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Media</h1>
          <p className="mt-2 text-white/70">Audio tracks, studio clips, and YouTube sessions.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm underline text-white/70 hover:text-white">
            Home
          </Link>
        </div>
      </div>

      {/* Status */}
      <div className="mt-8">
        {busy ? <p className="text-white/70">Loading media…</p> : null}

        {!busy && error ? (
          <div className={`${panel} p-5`}>
            <p className="text-sm text-white/80">Couldn’t load media.</p>
            <p className="mt-2 text-xs text-white/60 break-words">{error}</p>
            <p className="mt-3 text-xs text-white/60">
              If you see <span className="font-semibold">Missing or insufficient permissions</span>, your
              Firestore rules need to allow public read for <code>mediaItems</code>.
            </p>
          </div>
        ) : null}

        {!busy && !error && items.length === 0 ? (
          <div className={`${panel} p-6`}>
            <p className="text-white/80">No media posted yet.</p>
            <p className="mt-2 text-sm text-white/60">
              Add an item in Admin and (optional) set <code>active</code> = true.
            </p>
          </div>
        ) : null}
      </div>

      {/* Audio */}
      {!busy && !error && audioItems.length > 0 ? (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Audio</h2>
            <span className="text-xs text-white/55">{audioItems.length} track(s)</span>
          </div>

          <div className="mt-4 space-y-4">
            {audioItems.map((i) => (
              <div key={i.id} className={`${panel} p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold">{i.title}</h3>
                    <p className="mt-1 text-xs text-white/55">Streaming player below</p>
                  </div>
                </div>

                {i.audioUrl ? (
                  <audio className="mt-4 w-full" controls preload="none">
                    <source src={i.audioUrl} />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <p className="mt-4 text-sm text-white/60 italic">No audioUrl found for this item.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* YouTube */}
      {!busy && !error && youtubeItems.length > 0 ? (
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">YouTube</h2>
            <span className="text-xs text-white/55">{youtubeItems.length} video(s)</span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
            {youtubeItems.map((i) => (
              <div key={i.id} className={`${panel} overflow-hidden`}>
                <div className="p-5">
                  <h3 className="text-base font-semibold">{i.title}</h3>
                  {i.youtubeId ? (
                    <p className="mt-1 text-xs text-white/55">YouTube ID: {i.youtubeId}</p>
                  ) : (
                    <p className="mt-1 text-xs text-white/55 italic">
                      No youtubeId found (store youtubeId or youtubeUrl).
                    </p>
                  )}
                </div>

                {i.youtubeId ? (
                  <div className="aspect-video bg-black/40 border-t border-white/10">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${i.youtubeId}`}
                      title={i.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </SoftPageShell>
  );
}