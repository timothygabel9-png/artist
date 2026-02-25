"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust path if yours differs

type StudioMediaItem = {
  type?: string; // "image" | "audio" | "video" | ...
  url?: string;
  path?: string;
};

type StudioProject = {
  id: string;
  title?: string;
  description?: string;
  status?: "in_progress" | "review" | "complete" | string;
  active?: boolean;
  coverImageUrl?: string;
  coverImagePath?: string;
  media?: StudioMediaItem[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

function prettyStatus(status?: string) {
  if (!status) return "In progress";
  if (status === "in_progress") return "In progress";
  if (status === "review") return "In review";
  if (status === "complete") return "Complete";
  return status;
}

function statusPillClass(status?: string) {
  // all dark, subtle — still readable
  switch (status) {
    case "complete":
      return "border-white/25 text-white/90";
    case "review":
      return "border-white/20 text-white/80";
    case "in_progress":
    default:
      return "border-white/15 text-white/70";
  }
}

export default function StudioPublic() {
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only public/active projects, newest first
    const q = query(
      collection(db, "studioProjects"),
      where("active", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: StudioProject[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StudioProject, "id">),
        }));
        setProjects(list);
        setLoading(false);
      },
      (err) => {
        console.error("StudioPublic onSnapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const heroSubtitle = useMemo(() => {
    if (loading) return "Loading current work…";
    if (!projects.length) return "No active projects yet. Check back soon.";
    return "Current works in progress — updated as projects evolve.";
  }, [loading, projects.length]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Subtle background texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background:radial-gradient(circle_at_20%_10%,white,transparent_35%),radial-gradient(circle_at_80%_30%,white,transparent_30%),radial-gradient(circle_at_50%_80%,white,transparent_35%)]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
        {/* Header */}
        <header className="mb-10 sm:mb-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Studio
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            {heroSubtitle}
          </p>

          {/* Optional: small nav back to home if your shell doesn’t include it */}
          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:border-white/20 hover:bg-white/10"
            >
              ← Back
            </Link>
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && projects.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white/70">
            No projects are active yet.
          </div>
        )}

        {/* Projects grid */}
        {!loading && projects.length > 0 && (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <article
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                {/* Cover */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/[0.03]">
                  {p.coverImageUrl ? (
                    // regular img (not Next/Image) keeps it simple for shells
                    <img
                      src={p.coverImageUrl}
                      alt={p.title || "Studio project cover"}
                      className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:opacity-100 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                      No cover image
                    </div>
                  )}

                  {/* Status pill */}
                  <div className="absolute left-3 top-3">
                    <span
                      className={`inline-flex items-center rounded-full border bg-black/40 px-3 py-1 text-xs ${statusPillClass(
                        p.status
                      )}`}
                    >
                      {prettyStatus(p.status)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-base font-semibold tracking-tight text-white/95">
                    {p.title || "Untitled project"}
                  </h2>

                  {p.description ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/70">
                      {p.description}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-white/40">
                      No description yet.
                    </p>
                  )}

                  {/* Media preview (optional) */}
                  {Array.isArray(p.media) && p.media.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.media.slice(0, 3).map((m, idx) => (
                        <span
                          key={`${p.id}-m-${idx}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                        >
                          {m.type || "media"}
                        </span>
                      ))}
                      {p.media.length > 3 && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
                          +{p.media.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer meta */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50">
                    <span>
                      {p.createdAt?.toDate
                        ? p.createdAt.toDate().toLocaleDateString()
                        : ""}
                    </span>
                    <span className="opacity-70">ID: {p.id.slice(0, 6)}…</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}