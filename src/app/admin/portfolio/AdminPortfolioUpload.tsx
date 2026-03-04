"use client";

import { useMemo, useState } from "react";
import DragDropUpload from "@/components/admin/DragDropUpload";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Keep these aligned with your portfolio.ts types
type ItemType = "mural" | "carpentry" | "graphic-design" | "signage";
type IndoorOutdoor = "indoor" | "outdoor";
type GraphicDesignCategory = "logos" | "tshirts" | "album-covers" | "show-posters" | "events";
type Category = IndoorOutdoor | GraphicDesignCategory;

type AdminPortfolioUploadProps = {
  presetType?: string;
  presetCategory?: string;
  lockType?: boolean;
  lockCategory?: boolean;
  titleOverride?: string;
};

function asItemType(v?: string): ItemType | "" {
  if (v === "mural" || v === "carpentry" || v === "graphic-design" || v === "signage") return v;
  return "";
}

function asCategory(v?: string): Category | "" {
  const ok: Category[] = [
    "indoor",
    "outdoor",
    "logos",
    "tshirts",
    "album-covers",
    "show-posters",
    "events",
  ];
  return v && (ok as string[]).includes(v) ? (v as Category) : "";
}

export default function AdminPortfolioUpload({
  presetType,
  presetCategory,
  lockType = false,
  lockCategory = false,
  titleOverride,
}: AdminPortfolioUploadProps) {
  // Basic fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [clientName, setClientName] = useState("");
  const [tagsText, setTagsText] = useState("");

  const presetT = asItemType(presetType);
  const presetC = asCategory(presetCategory);

  const [type, setType] = useState<ItemType | "">(presetT);
  const [category, setCategory] = useState<Category | "">(presetC);

  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Images
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const tags = useMemo(() => {
    return tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tagsText]);

  const canSave = title.trim().length > 0 && (lockType ? !!presetT : !!type) && (lockCategory ? !!presetC : !!category);

  async function onSave() {
    setMsg(null);

    const finalType = lockType ? presetT : (type as ItemType);
    const finalCategory = lockCategory ? presetC : (category as Category);

    if (!title.trim()) return setMsg("Title is required.");
    if (!finalType) return setMsg("Type is required.");
    if (!finalCategory) return setMsg("Category is required.");

    setBusy(true);
    try {
      const docRef = await addDoc(collection(db, "portfolioItems"), {
        title: title.trim(),
        description: description.trim() || "",
        location: location.trim() || "",
        clientName: clientName.trim() || "",

        type: finalType,
        category: finalCategory,

        tags,
        active,
        featured,

        coverImageUrl: coverImageUrl || "",
        imageUrls,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMsg(`Saved ✅ (${docRef.id})`);

      // reset (optional)
      setTitle("");
      setDescription("");
      setLocation("");
      setClientName("");
      setTagsText("");
      setFeatured(false);
      setActive(true);
      setCoverImageUrl("");
      setImageUrls([]);
      if (!lockType) setType(presetT);
      if (!lockCategory) setCategory(presetC);
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 text-white">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">{titleOverride || "Admin Portfolio Upload"}</h1>

        <button
          type="button"
          disabled={!canSave || busy}
          onClick={onSave}
          className="rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>

      {msg ? <div className="mt-3 text-sm text-white/70">{msg}</div> : null}

      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
        <div>
          <span className="text-white/60">presetType:</span>{" "}
          <span className="font-mono">{presetType ?? "(none)"}</span>{" "}
          {lockType ? <span className="ml-2 text-white/50">(locked)</span> : null}
        </div>
        <div className="mt-1">
          <span className="text-white/60">presetCategory:</span>{" "}
          <span className="font-mono">{presetCategory ?? "(none)"}</span>{" "}
          {lockCategory ? <span className="ml-2 text-white/50">(locked)</span> : null}
        </div>
      </div>

      {/* FORM */}
      <div className="mt-6 grid gap-4">
        <div>
          <label className="text-sm text-white/70">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
            placeholder="e.g. Aurora Coffee Shop Mural"
          />
        </div>

        <div>
          <label className="text-sm text-white/70">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full min-h-[120px] rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
            placeholder="Short description, materials, year, etc."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-white/70">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
              placeholder="Aurora, IL"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Client Name</label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
              placeholder="Client / Business"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-white/70">Type</label>
            <select
              value={lockType ? presetT : type}
              disabled={lockType}
              onChange={(e) => setType(e.target.value as any)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25 disabled:opacity-60"
            >
              <option value="">Select…</option>
              <option value="mural">mural</option>
              <option value="carpentry">carpentry</option>
              <option value="graphic-design">graphic-design</option>
              <option value="signage">signage</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white/70">Category</label>
            <select
              value={lockCategory ? presetC : category}
              disabled={lockCategory}
              onChange={(e) => setCategory(e.target.value as any)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25 disabled:opacity-60"
            >
              <option value="">Select…</option>
              <optgroup label="Mural">
                <option value="indoor">indoor</option>
                <option value="outdoor">outdoor</option>
              </optgroup>
              <optgroup label="Graphic Design">
                <option value="logos">logos</option>
                <option value="tshirts">tshirts</option>
                <option value="album-covers">album-covers</option>
                <option value="show-posters">show-posters</option>
                <option value="events">events</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-white/70">Tags (comma separated)</label>
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
            placeholder="e.g. bold, neon, retro"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>
        </div>
      </div>

      {/* UPLOADER */}
      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">Images</h2>

        <DragDropUpload
          folder={`portfolio/uploads/${(lockType ? presetT : type) || "misc"}/${(lockCategory ? presetC : category) || "misc"}`}
          multiple
          maxFiles={30}
          maxMB={20}
          onUploaded={(files) => {
            const urls = files.map((f) => f.url);
            setCoverImageUrl((prev) => prev || urls[0] || "");
            setImageUrls((prev) => [...urls, ...prev]);
          }}
        />

        {coverImageUrl ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Cover Image</div>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImageUrl} alt="" className="h-56 w-full object-cover" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:border-white/25"
                onClick={() => setCoverImageUrl("")}
              >
                Clear cover
              </button>
            </div>
          </div>
        ) : null}

        {imageUrls.length ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Gallery Images</div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {imageUrls.map((url, idx) => (
                <div key={url} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-40 w-full object-cover" />

                  <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/50 p-2 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      className="flex-1 rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                      onClick={() => setCoverImageUrl(url)}
                    >
                      Set cover
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                      onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white/80">
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}