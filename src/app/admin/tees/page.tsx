"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { isAdmin } from "@/lib/admin";
import { uploadFile } from "@/lib/upload";

type Fit = "men" | "women";
type Size = "XS" | "S" | "M" | "LG" | "XL" | "XXL" | "XXXL";

type ColorOpt = { name: string; hex: string };

const ALL_SIZES: Size[] = ["XS", "S", "M", "LG", "XL", "XXL", "XXXL"];
const ALL_FITS: Fit[] = ["men", "women"];
const ALL_COLORS: ColorOpt[] = [
  { name: "White", hex: "#ffffff" },
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Black", hex: "#111827" },
  { name: "Green", hex: "#22c55e" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Tie Dye", hex: "tiedye" },
];

export default function AdminTeesPage() {
  const [ready, setReady] = useState(false);
  const [adminOk, setAdminOk] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(28);
  const [active, setActive] = useState(true);

  const [fits, setFits] = useState<Fit[]>(["men", "women"]);
  const [sizes, setSizes] = useState<Size[]>(ALL_SIZES);
  const [colors, setColors] = useState<ColorOpt[]>(ALL_COLORS);

  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

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
    setFiles(Array.from(list));
  }

  function toggleFit(f: Fit) {
    setFits((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function toggleSize(s: Size) {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  const canSubmit = useMemo(() => {
    return title.trim() && price > 0 && fits.length > 0 && sizes.length > 0 && colors.length > 0 && files.length > 0;
  }, [title, price, fits.length, sizes.length, colors.length, files.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    if (!adminOk || !uid) return setStatus("Not authorized.");
    if (!title.trim()) return setStatus("Title is required.");
    if (!price || price <= 0) return setStatus("Price must be greater than 0.");
    if (files.length === 0) return setStatus("Please add at least one image.");

    setBusy(true);
    try {
      // 1) create product doc
      const ref = await addDoc(collection(db, "teeProducts"), {
        title: title.trim(),
        description: description.trim(),
        price,
        active,
        fits,
        sizes,
        colors, // array of {name, hex}
        images: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const productId = ref.id;

      // 2) upload images
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const safeName = f.name.replace(/[^\w.\-]+/g, "_");
        const path = `tees/${productId}/${Date.now()}_${i}_${safeName}`;
        setStatus(`Uploading ${i + 1}/${files.length}…`);
        const url = await uploadFile(f, path);
        urls.push(url);
      }

      // 3) update product doc with image urls
      await updateDoc(doc(db, "teeProducts", productId), {
        images: urls,
        updatedAt: serverTimestamp(),
      });

      setStatus("✅ Tee product created!");
      setTitle("");
      setDescription("");
      setPrice(28);
      setActive(true);
      setFits(["men", "women"]);
      setSizes(ALL_SIZES);
      setColors(ALL_COLORS);
      setFiles([]);
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message || "Failed to create tee product.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="p-6">Loading…</div>;

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
          Fix: Firestore doc <code>users/{uid}</code> with <code>role: "admin"</code>.
        </p>
        <Link className="underline" href="/admin">Back</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin • Tees</h1>
        <div className="flex items-center gap-4">
          <Link className="underline" href="/tees">View Tees</Link>
          <Link className="underline" href="/admin">Admin Home</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Title *</label>
          <input className="w-full border rounded p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="w-full border rounded p-2 min-h-[110px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Price *</label>
            <input
              type="number"
              min={1}
              step={1}
              className="w-full border rounded p-2"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input id="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <label htmlFor="active" className="text-sm">Active (show in shop)</label>
          </div>
        </div>

        <div className="border rounded p-4 space-y-3">
          <p className="font-medium">Fits *</p>
          <div className="flex gap-3 flex-wrap">
            {ALL_FITS.map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={fits.includes(f)} onChange={() => toggleFit(f)} />
                {f}
              </label>
            ))}
          </div>

          <p className="font-medium pt-2">Sizes *</p>
          <div className="flex gap-3 flex-wrap">
            {ALL_SIZES.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={sizes.includes(s)} onChange={() => toggleSize(s)} />
                {s}
              </label>
            ))}
          </div>

          <p className="font-medium pt-2">Colors *</p>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c) => (
              <span key={c.name} className="text-xs border rounded px-2 py-1">
                {c.name}
              </span>
            ))}
            <p className="text-xs text-gray-600 w-full">
              (For now this uses the default color list. We can make this editable later.)
            </p>
          </div>
        </div>

        <div className="border rounded p-4">
          <p className="font-medium">Product images *</p>
          <label className="inline-block cursor-pointer rounded bg-black px-4 py-2 text-sm font-semibold text-white">
            Browse Images
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onPickFiles(e.target.files)} />
          </label>
          <p className="text-xs text-gray-600 mt-2">{files.length ? `${files.length} file(s) selected` : "No files selected."}</p>
        </div>

        <button
          type="submit"
          disabled={busy || !canSubmit}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Create Tee Product"}
        </button>

        {status && <p className="text-sm mt-2">{status}</p>}
      </form>
    </main>
  );
}