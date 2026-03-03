"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { isAdmin } from "@/lib/admin";
import { uploadFile } from "@/lib/upload";

type ItemType = "mural" | "carpentry" | "graphic-design" | "signage";
type IndoorOutdoor = "indoor" | "outdoor";
type GraphicDesignCategory = "logos" | "tshirts" | "album-covers" | "show-posters" | "events";
type Category = IndoorOutdoor | GraphicDesignCategory;

const GRAPHIC_CATEGORIES: GraphicDesignCategory[] = [
  "logos",
  "tshirts",
  "album-covers",
  "show-posters",
  "events",
];

function isGraphicCategory(v: any): v is GraphicDesignCategory {
  return GRAPHIC_CATEGORIES.includes(v);
}

export default function AdminPortfolioUploadPage() {
  const sp = useSearchParams();
  const typeParam = (sp.get("type") || "") as ItemType | "";
  const catParam = (sp.get("category") || "") as Category | "";

  const [ready, setReady] = useState(false);
  const [adminOk, setAdminOk] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");

  const [type, setType] = useState<ItemType>("mural");
  const [category, setCategory] = useState<Category>("outdoor");

  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  // Prefill from query string
  useEffect(() => {
    if (typeParam) setType(typeParam);
    if (catParam) setCategory(catParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeParam, catParam]);

  // Keep category valid if type changes
  useEffect(() => {
    if (type === "graphic-design") {
      // If not a graphic category, default to logos
      if (!isGraphicCategory(category)) setCategory("logos");
    } else {
      // If user had a graphic category selected, reset to outdoor
      if (isGraphicCategory(category)) setCategory("outdoor");
    }
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

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

    if (!adminOk || !uid) return setStatus("Not authorized.");
    if (!title.trim()) return setStatus("Title is required.");
    if (files.length === 0) return setStatus("Please add at least one image.");
    if (coverIndex < 0 || coverIndex >= files.length) return setStatus("Cover image selection is invalid.");

    setBusy(true);
    try {
      // 1) Create Firestore doc first
      const refDoc = await addDoc(collection(db, "portfolioItems"), {
        active: true,
        featured: false,

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

      // 2) Upload images
      const uploadedUrls: string[] = [];
      const uploadedPaths: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const safeName = f.name.replace(/[^\w.\-]+/g, "_");
        const path = `portfolio/${itemId}/${Date.now()}_${i}_${safeName}`;

        const url = await uploadFile(f, path, { uniqueName: false });
        uploadedUrls.push(url);
        uploadedPaths.push(path);
      }

      const coverUrl = uploadedUrls[coverIndex];
      const coverPath = uploadedPaths[coverIndex];

      // 3) Update Firestore doc with URLs
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
      setDescription("");
      setTagsText("");
      setFiles([]);
      setCoverIndex(0);
    } catch (err: any) {
      console.error("UPLOAD ERROR:", err);
      setStatus(err?.code ? `${err.code}: ${err.message || "Upload failed."}` : err?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="p-6">Loading...</div>;

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
        <p className="text-red-400">This account is not an admin.</p>
        <p className="text-sm mt-2 text-white/70">
          Fix: in Firestore create <code>users/{uid}</code> with <code>role: "admin"</code>.
        </p>
        <Link className="underline" href="/admin">
          Back
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Portfolio Upload</h1>
          <div className="flex gap-4">
            <Link className="underline text-white/70 hover:text-white" href="/admin/graphic-design">
              Graphic Design Hub
            </Link>
            <Link className="underline text-white/70 hover:text-white" href="/admin">
              Admin Home
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input className="w-full rounded p-2 bg-white/10 border border-white/10" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Client name</label>
              <input className="w-full rounded p-2 bg-white/10 border border-white/10" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Culver’s, City of Aurora, etc" />
            </div>

            <div>
              <label className="block text-sm mb-1">Location</label>
              <input className="w-full rounded p-2 bg-white/10 border border-white/10" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Aurora, IL / Downtown / etc" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Type</label>
              <select className="w-full rounded p-2 bg-white/10 border border-white/10" value={type} onChange={(e) => setType(e.target.value as ItemType)}>
                <option value="mural">Mural</option>
                <option value="carpentry">Carpentry</option>
                <option value="graphic-design">Graphic Design</option>
                <option value="signage">Signage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Category</label>
              <select className="w-full rounded p-2 bg-white/10 border border-white/10" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
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

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea className="w-full rounded p-2 min-h-[120px] bg-white/10 border border-white/10" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Tags (comma-separated)</label>
            <input className="w-full rounded p-2 bg-white/10 border border-white/10" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="bright, downtown, vector, etc" />
          </div>

          <div className="rounded border border-white/10 p-4 bg-white/5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium">Images</p>
                <p className="text-sm text-white/60">Add multiple images. Pick which one is the cover.</p>
              </div>
              <label className="px-4 py-2 rounded bg-white text-black cursor-pointer font-medium">
                Add Images
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onPickFiles(e.target.files)} />
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 rounded border border-white/10 p-2 bg-white/5">
                    <div className="min-w-0">
                      <p className="truncate">{f.name}</p>
                      <p className="text-xs text-white/60">{Math.round(f.size / 1024)} KB</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="cover" checked={coverIndex === idx} onChange={() => setCoverIndex(idx)} />
                        Cover
                      </label>

                      <button type="button" className="px-3 py-1 rounded border border-white/15 hover:bg-white/10" onClick={() => removeFile(idx)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={busy} className="px-4 py-2 rounded bg-white text-black font-semibold disabled:opacity-60">
            {busy ? "Uploading..." : "Create Portfolio Item"}
          </button>

          {status && <p className="text-sm mt-2 text-white/80">{status}</p>}
        </form>
      </div>
    </main>
  );
}