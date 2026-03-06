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
import { db } from "@/lib/firebase";
import SoftPageShell from "@/components/SoftPageShell";

type StudioMediaItem = {
  type?: string;
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
    <SoftPageShell
      title="Studio"
      subtitle={heroSubtitle}
      variant="oceanNoir"
    >
      <main className="mx-auto w-full max-w-6xl px-4 py-8 text-white sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div />
          <Link
            href="/"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
          >
            Back Home
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="h-44 bg-white/10 sm:h-52" />
                <div className="p-4">
                  <div className="h-4 w-2/3 rounded bg-white/10" />
                  <div className="mt-3 h-3 w-full rounded bg-white/10" />
                  <div className="mt-2 h-3 w-4/5 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center sm:p-8">
            <div className="text-lg font-semibold sm:text-xl">No active projects</div>
            <div className="mt-2 text-white/70">
              Check back soon for new studio work and progress updates.
            </div>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {projects.map((p) => (
              <article
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
              >
                <div className="relative h-44 w-full overflow-hidden bg-white/5 sm:h-52">
                  {p.coverImageUrl ? (
                    <img
                      src={p.coverImageUrl}
                      alt={p.title || "Studio project cover"}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
                      No cover image
                    </div>
                  )}

                  <div className="absolute left-3 top-3">
                    <span
                      className={`inline-flex items-center rounded-full border bg-black/50 px-3 py-1 text-xs backdrop-blur ${statusPillClass(
                        p.status
                      )}`}
                    >
                      {prettyStatus(p.status)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="truncate text-base font-semibold sm:text-lg">
                      {p.title || "Untitled project"}
                    </h2>
                  </div>

                  {p.description ? (
                    <p className="mt-3 line-clamp-3 text-sm text-white/75">
                      {p.description}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-white/40">
                      No description yet.
                    </p>
                  )}

                  {Array.isArray(p.media) && p.media.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.media.slice(0, 3).map((m, idx) => (
                        <span
                          key={`${p.id}-m-${idx}`}
                          className="rounded border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/80"
                        >
                          {m.type || "media"}
                        </span>
                      ))}
                      {p.media.length > 3 && (
                        <span className="rounded border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/50">
                          +{p.media.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50">
                    <span>
                      {p.createdAt?.toDate
                        ? p.createdAt.toDate().toLocaleDateString()
                        : ""}
                    </span>
                    <span>ID: {p.id.slice(0, 6)}…</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </SoftPageShell>
  );
}