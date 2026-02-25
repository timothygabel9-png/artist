"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { hardDeleteStudioProject } from "@/lib/adminActions";
import { Row, Button } from "./AdminUI";

type StudioProject = {
  id: string;
  title?: string;
  description?: string;
  status?: "in_progress" | "review" | "complete" | string;
  active?: boolean;
  coverImageUrl?: string;
  coverImagePath?: string;
};

const STATUS_OPTIONS = ["in_progress", "review", "complete"] as const;

export default function StudioAdmin() {
  const [items, setItems] = useState<StudioProject[]>([]);
  const [loading, setLoading] = useState(true);

  // editor state
  const [editing, setEditing] = useState<StudioProject | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("in_progress");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "studioProjects"), orderBy("createdAt", "desc"));
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

  const isEditing = useMemo(() => Boolean(editing?.id), [editing]);

  function openNew() {
    setEditing({ id: "" });
    setTitle("");
    setDescription("");
    setStatus("in_progress");
    setActive(true);
  }

  function openEdit(p: StudioProject) {
    setEditing(p);
    setTitle(p.title || "");
    setDescription(p.description || "");
    setStatus((p.status as any) || "in_progress");
    setActive(p.active ?? true);
  }

  async function save() {
    setSaving(true);
    try {
      if (!editing) return;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        active,
        updatedAt: serverTimestamp(),
      };

      if (!isEditing) {
        await addDoc(collection(db, "studioProjects"), {
          ...payload,
          createdAt: serverTimestamp(),
          // you can set coverImageUrl/Path later via upload UI
        });
      } else {
        await updateDoc(doc(db, "studioProjects", editing.id), payload);
      }

      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Studio</h2>
          <p className="mt-1 text-sm text-white/60">
            Remove = <b>hard delete</b> (permanent)
          </p>
        </div>
        <Button onClick={openNew}>+ Add Studio Project</Button>
      </div>

      {/* Editor */}
      {editing && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 text-sm font-semibold text-white/90">
            {isEditing ? "Edit project" : "Add project"}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs text-white/60">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                placeholder="Project title"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-white/60">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 sm:col-span-2">
              <span className="text-xs text-white/60">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                placeholder="What’s in progress?"
              />
            </label>

            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span className="text-sm text-white/70">Active (public)</span>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={save}
              variant={saving ? "default" : "default"}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button onClick={() => setEditing(null)} variant="default">
              Cancel
            </Button>
          </div>

          <p className="mt-3 text-xs text-white/50">
            Upload UI (cover + media files) can be added next—this form handles the Firestore fields first.
          </p>
        </div>
      )}

      {/* List */}
      <div className="mt-5 grid gap-3">
        {loading && <div className="text-sm text-white/60">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="text-sm text-white/60">No studio projects found.</div>
        )}

        {items.map((it) => (
          <Row
            key={it.id}
            title={it.title || "Untitled project"}
            subtitle={`status: ${it.status || "in_progress"} • active: ${String(
              it.active
            )}`}
            right={
              <>
                <Button onClick={() => openEdit(it)}>Edit</Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!confirm("Permanently delete this studio project?")) return;
                    await hardDeleteStudioProject(it.id);
                  }}
                >
                  Remove (Delete)
                </Button>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}