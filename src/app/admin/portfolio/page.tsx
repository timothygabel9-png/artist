"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { isAdmin } from "@/lib/admin";
import { uploadFile } from "@/lib/upload";
import Link from "next/link";

type ItemType = "mural" | "carpentry";
type Category = "indoor" | "outdoor";

export default function AdminPortfolioUpload() {
  const [ready, setReady] = useState(false);
  const [adminOk, setAdminOk] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ItemType>("mural");
  const [category, setCategory] = useState<Category>("outdoor");
  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);

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

    if (!adminOk || !uid) {
      setStatus("Not authorized.");
      return;
    }
    if (!title.trim()) {
      setStatus("Title is required.");
      return;
    }
    if (files.length === 0) {
      setStatus("Please add at least one image.");
      return;
    }
    if (coverIndex < 0 || coverIndex >= files.length) {
      setStatus("Cover image selection is invalid.");
      return;
    }

    setBusy(true);
    try {
      // 1) Create Firestore doc first (so we have an ID for Storage path)
      const ref = await addDoc(collection(db, "portfolioItems"), {
        title: title.trim(),
        type,
        category,
        description: description.trim(),
        tags,
        featured: false,
        coverImageUrl: "",
        imageUrls: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const itemId = ref.id;

      // 2) Upload images to Storage
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const safeName = f.name.replace(/[^\w.\-]+/g, "_");
        const path = `portfolio/${itemId}/${Date.now()}_${i}_${safeName}`;
        const url = await uploadFile(f, path);
        uploadedUrls.push(url);
        setStatus(`Uploaded ${i + 1}/${files.length}...`);
      }

      const coverUrl = uploadedUrls[coverIndex];

      // 3) Update Firestore doc with URLs
      await updateDoc(doc(db, "portfolioItems", itemId), {
        imageUrls: uploadedUrls,
        coverImageUrl: coverUrl,
        updatedAt: serverTimestamp(),
      });

      setStatus("✅ Portfolio item created!");
      setTitle("");
      setDescription("");
      setTagsText("");
      setFiles([]);
      setCoverIndex(0);
   } catch (err: any) {
  console.error("UPLOAD ERROR:", err);
  setStatus(
    err?.code
      ? `${err.code}: ${err.message || "Upload failed."}`
      : (err?.message || "Upload failed.")
  );
} finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="p-6">Loading...</div>;

  if (!uid) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p>You are not signed in.</p>
        <Link className="underline" href="/admin">Go to Admin Login</Link>
      </div>
    );
  }

  if (!adminOk) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-red-700">This account is not an admin.</p>
        <p className="text-sm mt-2">
          Fix: in Firestore create <code>users/{uid}</code> with <code>role: "admin"</code>.
        </p>
        <Link className="underline" href="/admin">Back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portfolio Upload</h1>
        <Link className="underline" href="/admin">Admin Home</Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input className="w-full border rounded p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select className="w-full border rounded p-2" value={type} onChange={(e) => setType(e.target.value as ItemType)}>
              <option value="mural">Mural</option>
              <option value="carpentry">Carpentry</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              className="w-full border rounded p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              <option value="outdoor">Outdoor</option>
              <option value="indoor">Indoor</option>
            </select>
          </div>
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
            placeholder="bright, animals, downtown"
          />
        </div>

        <div className="border rounded p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-medium">Images</p>
              <p className="text-sm text-gray-600">Add multiple images. Pick which one is the cover.</p>
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
                <div key={idx} className="flex items-center justify-between gap-3 border rounded p-2">
                  <div className="min-w-0">
                    <p className="truncate">{f.name}</p>
                    <p className="text-xs text-gray-600">{Math.round(f.size / 1024)} KB</p>
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
