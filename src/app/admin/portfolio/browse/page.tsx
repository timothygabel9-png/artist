"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { isAdmin } from "@/lib/admin";
import { uploadFile } from "@/lib/upload";

type ItemType = "mural" | "carpentry" | "graphic-design" | "signage";
type IndoorOutdoor = "indoor" | "outdoor";
type GraphicDesignCategory =
  | "logos"
  | "tshirts"
  | "album-covers"
  | "show-posters"
  | "events";
type Category = IndoorOutdoor | GraphicDesignCategory;

export default function AdminPortfolioUploadPage() {
  const [ready, setReady] = useState(false);
  const [adminOk, setAdminOk] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  // Fields
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");

  const [type, setType] = useState<ItemType>("mural");
  const [category, setCategory] = useState<Category>("outdoor");

  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");

  // Images
  const [files, setFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);

  // Status
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const tags = useMemo(
    () =>
      tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsText]
  );

  // Keep category valid when type changes
  useEffect(() => {
    if (type === "graphic-design") {
      // if currently indoor/outdoor, pick a reasonable default
      if (category === "indoor" || category === "outdoor") setCategory("logos");
      return;
    }
    // non-graphic: only indoor/outdoor
    if (
      category === "logos" ||
      category === "tshirts" ||
      category === "album-covers" ||
      category === "show-posters" ||
      category === "events"
    ) {
      setCategory("outdoor");
    }
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setReady(true);
      if (!user) {
        setUid(null);
        setAdminOk(false);
        return;
      }
      setUid(user.uid);
      setAdminOk(await isAdmin(user.uid));
    });
    return () => unsub();
  }, []);

  function onPickFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list);
    setFiles((prev) => [...prev, ...arr]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    if (coverIndex === idx) setCoverIndex(0);
    if (coverIndex > idx) setCoverIndex((c) => c - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    if (!adminOk || !uid) return setStatus("Not authorized.");
    if (!title.trim()) return setStatus("Title is required.");
    if (files.length === 0) return setStatus("Please add at least one image.");
    if (coverIndex < 0 || coverIndex >= files.length)
      return setStatus("Cover image selection is invalid.");

    setBusy(true);

    try {
      // 1) Create Firestore doc first (get ID for Storage folder)
      const refDoc = await addDoc(collection(db, "portfolioItems"), {
        active,
        featured,
        title: title.trim(),
        clientName: clientName.trim(),
        location: location.trim(),
        type,
        category,
        description: description.trim(),
        tags,
        coverImageUrl: "",
        coverImagePath: "",
        imageUrls: [],
        imagePaths: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const itemId = refDoc.id;

      // 2) Upload images to Storage
      const uploadedUrls: string[] = [];
      const uploadedPaths: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];

        const safeName = (f.name || "upload").replace(/[^\w.\-]+/g, "_");
        const path = `portfolio/${itemId}/${Date.now()}_${i}_${safeName}`;

        // NOTE: uploadFile already validates allowed paths/types
        const url = await uploadFile(f, path, { uniqueName: false });

        uploadedUrls.push(url);
        uploadedPaths.push(path);
      }

      const coverUrl = uploadedUrls[coverIndex];
      const coverPath = uploadedPaths[coverIndex];

      // 3) Update Firestore doc with URLs + Paths
      await updateDoc(doc(db, "portfolioItems", itemId), {
        imageUrls: uploadedUrls,
        imagePaths: uploadedPaths,
        coverImageUrl: coverUrl,
        coverImagePath: coverPath,
        updatedAt: serverTimestamp(),
      });

      setStatus("✅ Portfolio item created!");
      setTitle("");
      setClientName("");
      setLocation("");
      setType("mural");
      setCategory("outdoor");
      setFeatured(false);
      setActive(true);
      setDescription("");
      setTagsText("");
      setFiles([]);
      setCoverIndex(0);
    } catch (err: any) {
      console.error("UPLOAD ERROR:", err);
      setStatus(
        err?.code
          ? `${err.code}: ${err.message || "Upload failed."}`
          : err?.message || "Upload failed."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="p-6">Loading…</div>;

  if (!uid) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p>You are not signed in.</p>
        <Link className="underline" href="/admin">
          Go to Admin Login
        </Link>
      </div>
    );
  }

  if (!adminOk) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-red-700">This account is not an admin.</p>
        <p className="text-sm mt-2">
          Fix: in Firestore create <code>users/{uid}</code> with{" "}
          <code>role: "admin"</code>.
        </p>
        <Link className="underline" href="/admin">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portfolio Upload</h1>
        <div className="flex gap-3">
          <Link className="underline" href="/admin">
            Admin Home
          </Link>
          {/* Optional: if you keep a manage page */}
          <Link className="underline" href="/admin/portfolio/manage">
            Manage
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Client name</label>
            <input
              className="w-full border rounded p-2"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Culver’s, City of Aurora, Private client…"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Location</label>
            <input
              className="w-full border rounded p-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Aurora, IL • Batavia, IL • Downtown…"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              className="w-full border rounded p-2"
              value={type}
              onChange={(e) => setType(e.target.value as ItemType)}
            >
              <option value="mural">Mural</option>
              <option value="carpentry">Carpentry</option>
              <option value="graphic-design">Graphic Design</option>
              <option value="signage">Signage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              className="w-full border rounded p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {type === "graphic-design" ? (
                <>
                  <option value="logos">/graphic-design/logos</option>
                  <option value="tshirts">/graphic-design/tshirts</option>
                  <option value="album-covers">/graphic-design/album-covers</option>
                  <option value="show-posters">/graphic-design/show-posters</option>
                  <option value="events">/graphic-design/events</option>
                </>
              ) : (
                <>
                  <option value="outdoor">Outdoor</option>
                  <option value="indoor">Indoor</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active (shows on public site)
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Featured
          </label>
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            className="w-full border rounded p-2 min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Tags (comma-separated)</label>
          <input
            className="w-full border rounded p-2"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="bright, downtown, floral"
          />
        </div>

        <div className="border rounded p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-medium">Images</p>
              <p className="text-sm text-gray-600">
                Add multiple images. Pick which one is the cover.
              </p>
            </div>

            <label className="px-4 py-2 rounded bg-black text-white cursor-pointer">
              Add Images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onPickFiles(e.target.files)}
              />
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 border rounded p-2"
                >
                  <div className="min-w-0">
                    <p className="truncate">{f.name}</p>
                    <p className="text-xs text-gray-600">
                      {Math.round(f.size / 1024)} KB
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cover"
                        checked={coverIndex === idx}
                        onChange={() => setCoverIndex(idx)}
                      />
                      Cover
                    </label>

                    <button
                      type="button"
                      className="px-3 py-1 rounded border"
                      onClick={() => removeFile(idx)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
        >
          {busy ? "Uploading..." : "Create Portfolio Item"}
        </button>

        {status && <p className="text-sm mt-2">{status}</p>}
      </form>
    </div>
  );
}