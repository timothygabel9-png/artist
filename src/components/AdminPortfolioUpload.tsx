"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, ref as storageRef } from "firebase/storage";

import { auth, db, storage } from "@/lib/firebase";
import { isAdmin } from "@/lib/admin";
import { uploadFile } from "@/lib/upload";

/* ============================================================
   TYPES (keep aligned with your portfolio.ts)
============================================================ */
type ItemType = "mural" | "carpentry" | "graphic-design" | "signage";
type IndoorOutdoor = "indoor" | "outdoor";
type GraphicDesignCategory =
  | "logos"
  | "tshirts"
  | "album-covers"
  | "show-posters"
  | "events";
type Category = IndoorOutdoor | GraphicDesignCategory;

const GRAPHIC_CATEGORIES: GraphicDesignCategory[] = [
  "logos",
  "tshirts",
  "album-covers",
  "show-posters",
  "events",
];

type TeeColor = { name: string; hex: string };
type Fit = "men" | "women";

type Props = {
  presetType?: ItemType;
  presetCategory?: Category;
  lockType?: boolean;
  lockCategory?: boolean;
  titleOverride?: string;
  backHref?: string; // optional, lets wrappers send user back to hub
};

/* ============================================================
   SMALL REUSABLE ADMIN UI SYSTEM
============================================================ */
function AdminShell({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-neutral-950 to-black" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <div className="flex items-center gap-4 text-sm">{right}</div>
        </div>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
      <div className="mb-4">
        <div className="text-lg font-semibold">{title}</div>
        {subtitle ? (
          <div className="text-sm text-white/60 mt-1">{subtitle}</div>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-white/80 mb-1">{label}</label>
      {children}
      {hint ? <div className="text-xs text-white/50 mt-1">{hint}</div> : null}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-md border border-white/15 bg-white/10 px-3 py-2",
        "text-white placeholder:text-white/35",
        "outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10",
        props.className || "",
      ].join(" ")}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-md border border-white/15 bg-white/10 px-3 py-2",
        "text-white placeholder:text-white/35",
        "outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10",
        props.className || "",
      ].join(" ")}
    />
  );
}

function Button({
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "bg-white text-black hover:bg-white/90"
      : variant === "danger"
      ? "bg-red-500/15 text-red-200 border border-red-400/25 hover:bg-red-500/20"
      : "bg-white/10 text-white border border-white/15 hover:bg-white/15";

  return <button {...props} className={`${base} ${styles} ${props.className || ""}`} />;
}

/** Fully-styleable dropdown (no Windows white select menu) */
function AdminSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-adminselect]")) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" data-adminselect>
      <label className="block text-sm text-white/80 mb-1">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-left text-white hover:border-white/30 disabled:opacity-60"
      >
        {selected?.label ?? "Select..."}
      </button>

      {open && !disabled ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border border-white/10 bg-neutral-950 shadow-2xl">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition ${
                value === opt.value
                  ? "bg-white text-black"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   IMAGE LIST MODEL (supports existing + new files)
============================================================ */
type ImageItem = {
  id: string; // stable key
  kind: "existing" | "new";
  url: string; // preview URL (existing url or objectURL)
  path?: string; // storage path for existing (for deletion)
  file?: File; // for new uploads
  name?: string;
  size?: number;
};

function uidKey() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function AdminPortfolioUpload(props: Props) {
  const {
    presetType,
    presetCategory,
    lockType = false,
    lockCategory = false,
    titleOverride,
    backHref,
  } = props;

  const searchParams = useSearchParams();

  // If a wrapper uses query params (?id=...) we support edit mode automatically.
  const editId = searchParams?.get("id") || "";
  const forceMode = searchParams?.get("mode") || ""; // optional: "portfolio" | "tees"
  const initialTypeQP = searchParams?.get("type") || "";
  const initialCategoryQP = searchParams?.get("category") || "";

  const [ready, setReady] = useState(false);
  const [adminOk, setAdminOk] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  // shared fields
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<ItemType>(
    (presetType ??
      (initialTypeQP as ItemType) ??
      "mural") as ItemType
  );
  const [category, setCategory] = useState<Category>(
    (presetCategory ??
      (initialCategoryQP as Category) ??
      "outdoor") as Category
  );
  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");

  // images
  const [images, setImages] = useState<ImageItem[]>([]);
  const [coverId, setCoverId] = useState<string>("");

  // tshirt store fields (only used when category === "tshirts")
  const tshirtModeDefault =
    forceMode === "tees" ? true : forceMode === "portfolio" ? false : true;
  const [saveAsStoreProduct, setSaveAsStoreProduct] = useState<boolean>(
    tshirtModeDefault
  );
  const [teePrice, setTeePrice] = useState<string>("25");
  const [teeFits, setTeeFits] = useState<Fit[]>(["men", "women"]);
  const [teeSizes, setTeeSizes] = useState<string[]>(["S", "M", "L", "XL", "2XL"]);
  const [teeColors, setTeeColors] = useState<TeeColor[]>([
    { name: "White", hex: "#ffffff" },
    { name: "Black", hex: "#111827" },
  ]);
  const [teeActive, setTeeActive] = useState<boolean>(true);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  // drag state
  const dragIdRef = useRef<string | null>(null);

  // derived
  const tags = useMemo(
    () =>
      tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsText]
  );

  const isGraphicDesign = type === "graphic-design";
  const isTshirtsCategory = isGraphicDesign && category === "tshirts";

  // enforce category rules when type changes
  useEffect(() => {
    if (type === "graphic-design") {
      if (!GRAPHIC_CATEGORIES.includes(category as any)) {
        setCategory(presetCategory ?? "logos");
      }
      return;
    }

    if (GRAPHIC_CATEGORIES.includes(category as any)) {
      setCategory("outdoor");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // If presets change
  useEffect(() => {
    if (presetType) setType(presetType);
  }, [presetType]);
  useEffect(() => {
    if (presetCategory) setCategory(presetCategory);
  }, [presetCategory]);

  // auth/admin check
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

  // Load edit item (portfolioItems OR teeProducts)
  useEffect(() => {
    if (!adminOk || !uid) return;
    if (!editId) return;

    let alive = true;
    (async () => {
      setBusy(true);
      setStatus("");

      try {
        // If category tshirts and saving as store product, default to teeProducts
        const preferTees =
          forceMode === "tees" || (isTshirtsCategory && saveAsStoreProduct);

        // Try preferred first, then fall back
        const tryCollections = preferTees
          ? (["teeProducts", "portfolioItems"] as const)
          : (["portfolioItems", "teeProducts"] as const);

        let found: { col: "teeProducts" | "portfolioItems"; data: any } | null =
          null;

        for (const col of tryCollections) {
          const snap = await getDoc(doc(db, col, editId));
          if (snap.exists()) {
            found = { col, data: snap.data() };
            break;
          }
        }

        if (!found) throw new Error("Edit item not found.");

        if (!alive) return;

        // Map document -> form
        const data = found.data;

        setTitle(String(data?.title ?? ""));
        setClientName(String(data?.clientName ?? ""));
        setLocation(String(data?.location ?? ""));
        setDescription(String(data?.description ?? ""));
        setTagsText(Array.isArray(data?.tags) ? data.tags.join(", ") : "");

        if (found.col === "portfolioItems") {
          setType((data?.type as ItemType) || type);
          setCategory((data?.category as Category) || category);
        }

        // Images mapping
        const existingUrls: string[] = Array.isArray(data?.imageUrls)
          ? data.imageUrls.filter(Boolean)
          : Array.isArray(data?.images)
          ? data.images.filter(Boolean)
          : [];

        const existingPaths: string[] = Array.isArray(data?.imagePaths)
          ? data.imagePaths
          : [];

        const list: ImageItem[] = existingUrls.map((url, i) => ({
          id: uidKey(),
          kind: "existing",
          url,
          path: existingPaths?.[i],
          name: `existing-${i + 1}`,
        }));

        setImages(list);

        // cover
        const coverUrl = String(data?.coverImageUrl ?? "");
        const coverMatch = list.find((x) => x.url === coverUrl);
        setCoverId(coverMatch?.id || (list[0]?.id ?? ""));

        // tee fields if teeProducts
        if (found.col === "teeProducts") {
          setSaveAsStoreProduct(true);
          setTeeActive(data?.active === true);
          setTeePrice(String(data?.price ?? "25"));

          setTeeFits(Array.isArray(data?.fits) ? data.fits : ["men", "women"]);
          setTeeSizes(Array.isArray(data?.sizes) ? data.sizes : ["S", "M", "L"]);
          setTeeColors(
            Array.isArray(data?.colors) && data.colors.length
              ? data.colors
              : [
                  { name: "White", hex: "#ffffff" },
                  { name: "Black", hex: "#111827" },
                ]
          );

          // ensure UX matches "tshirts"
          setType("graphic-design");
          setCategory("tshirts");
        }
      } catch (e: any) {
        if (!alive) return;
        setStatus(e?.message || "Failed to load edit item.");
      } finally {
        if (alive) setBusy(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminOk, uid, editId]);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const toAdd: ImageItem[] = Array.from(fileList).map((f) => ({
      id: uidKey(),
      kind: "new",
      url: URL.createObjectURL(f),
      file: f,
      name: f.name,
      size: f.size,
    }));

    setImages((prev) => {
      const next = [...prev, ...toAdd];
      if (!coverId && next[0]) setCoverId(next[0].id);
      return next;
    });
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const next = prev.filter((x) => x.id !== id);
      if (coverId === id) setCoverId(next[0]?.id ?? "");
      return next;
    });
  }

  function moveImage(dragId: string, overId: string) {
    if (dragId === overId) return;
    setImages((prev) => {
      const from = prev.findIndex((x) => x.id === dragId);
      const to = prev.findIndex((x) => x.id === overId);
      if (from < 0 || to < 0) return prev;

      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  }

  function toggleFit(f: Fit) {
    setTeeFits((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  function addSize(s: string) {
    const v = s.trim().toUpperCase();
    if (!v) return;
    setTeeSizes((prev) => (prev.includes(v) ? prev : [...prev, v]));
  }

  function removeSize(s: string) {
    setTeeSizes((prev) => prev.filter((x) => x !== s));
  }

  function updateColor(idx: number, patch: Partial<TeeColor>) {
    setTeeColors((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  function addColor() {
    setTeeColors((prev) => [...prev, { name: "New Color", hex: "#ffffff" }]);
  }

  function removeColor(idx: number) {
    setTeeColors((prev) => prev.filter((_, i) => i !== idx));
  }

  async function deleteStoragePath(path?: string) {
    if (!path) return;
    try {
      await deleteObject(storageRef(storage, path));
    } catch {
      // ignore missing/permission errors - still allow deleting doc
    }
  }

  async function handleDelete() {
    if (!adminOk || !uid) return;
    if (!editId) {
      setStatus("Nothing to delete (no edit id).");
      return;
    }

    const ok = window.confirm(
      "Delete this item? This cannot be undone.\n\nTip: If you want to keep images, choose Cancel and set Active=false instead."
    );
    if (!ok) return;

    setBusy(true);
    setStatus("");

    try {
      // Decide which collection we're deleting from
      const preferTees =
        forceMode === "tees" || (isTshirtsCategory && saveAsStoreProduct);

      const col = preferTees ? "teeProducts" : "portfolioItems";

      // Attempt to fetch (so we can cleanup storage paths)
      const snap = await getDoc(doc(db, col, editId));
      if (snap.exists()) {
        const data: any = snap.data();
        const paths: string[] = Array.isArray(data?.imagePaths)
          ? data.imagePaths
          : [];
        // tees might not have paths; still safe
        for (const p of paths) await deleteStoragePath(p);
        if (data?.coverImagePath) await deleteStoragePath(data.coverImagePath);
      }

      await deleteDoc(doc(db, col, editId));
      setStatus("✅ Deleted.");

      // Optional: redirect
      // window.location.href = backHref ?? "/admin";
    } catch (e: any) {
      setStatus(e?.message || "Delete failed.");
    } finally {
      setBusy(false);
    }
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

    if (images.length === 0) {
      setStatus("Please add at least one image.");
      return;
    }

    if (!coverId || !images.some((x) => x.id === coverId)) {
      setStatus("Please choose a cover image.");
      return;
    }

    // For tees store products
    const willSaveToTees = isTshirtsCategory && saveAsStoreProduct;
    if (willSaveToTees) {
      const priceNum = Number(teePrice);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        setStatus("T-Shirt price must be a valid number.");
        return;
      }
      if (!teeFits.length) {
        setStatus("Select at least one Fit (Men/Women).");
        return;
      }
      if (!teeSizes.length) {
        setStatus("Add at least one Size.");
        return;
      }
      if (!teeColors.length || teeColors.some((c) => !c.name || !c.hex)) {
        setStatus("Add valid Colors (name + hex).");
        return;
      }
    }

    setBusy(true);

    try {
      // Decide collection + storage base path
      const colName = willSaveToTees ? "teeProducts" : "portfolioItems";
      const storageBase = willSaveToTees ? "tees" : "portfolio";

      const isEdit = Boolean(editId);

      // Load existing doc (edit) so we can preserve existing images/paths
      let existingDoc: any = null;
      if (isEdit) {
        const snap = await getDoc(doc(db, colName, editId));
        if (!snap.exists()) throw new Error("Edit document not found.");
        existingDoc = snap.data();
      }

      // Create/update base doc first
      let itemId = editId;
      if (!isEdit) {
        const ref = await addDoc(collection(db, colName), {
          ...(willSaveToTees
            ? {
                active: teeActive,
                title: title.trim(),
                description: description.trim(),
                price: Number(teePrice),
                fits: teeFits,
                sizes: teeSizes,
                colors: teeColors,
                images: [],
                createdAt: serverTimestamp(),
              }
            : {
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
              }),
        });
        itemId = ref.id;
      } else {
        // update base fields (without images yet)
        await updateDoc(doc(db, colName, itemId), {
          ...(willSaveToTees
            ? {
                active: teeActive,
                title: title.trim(),
                description: description.trim(),
                price: Number(teePrice),
                fits: teeFits,
                sizes: teeSizes,
                colors: teeColors,
              }
            : {
                title: title.trim(),
                clientName: clientName.trim(),
                location: location.trim(),
                type,
                category,
                description: description.trim(),
                tags,
                updatedAt: serverTimestamp(),
              }),
        });
      }

      // Build final ordered images:
      // - Existing stay as-is (and preserve their paths if portfolio mode)
      // - New get uploaded now in the displayed order
      const finalUrls: string[] = [];
      const finalPaths: string[] = [];

      // Existing (preserve)
      for (const img of images) {
        if (img.kind === "existing") {
          finalUrls.push(img.url);
          if (!willSaveToTees) finalPaths.push(img.path || "");
        }
      }

      // Upload new in order where they appear (intermixed)
      // We must respect the current order, so we upload by walking the list and appending new items where they are.
      // Approach: rebuild from scratch in list order.
      const rebuiltUrls: string[] = [];
      const rebuiltPaths: string[] = [];

      // Build a quick lookup of existing urls/paths
      const existingMap = new Map<string, { url: string; path?: string }>();
      for (const img of images) {
        if (img.kind === "existing") existingMap.set(img.id, { url: img.url, path: img.path });
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        if (img.kind === "existing") {
          const ex = existingMap.get(img.id)!;
          rebuiltUrls.push(ex.url);
          if (!willSaveToTees) rebuiltPaths.push(ex.path || "");
          continue;
        }

        // new upload
        const f = img.file!;
        const safeName = (f.name || "image").replace(/[^\w.\-]+/g, "_");
        const path = `${storageBase}/${itemId}/${Date.now()}_${i}_${safeName}`;

        const url = await uploadFile(f, path, { uniqueName: false });
        rebuiltUrls.push(url);
        if (!willSaveToTees) rebuiltPaths.push(path);
      }

      // Cover URL
      const coverUrl = (() => {
        const coverItem = images.find((x) => x.id === coverId);
        if (!coverItem) return rebuiltUrls[0];
        if (coverItem.kind === "existing") return coverItem.url;
        // For new cover: find its position in list order and use rebuiltUrls at that index
        const idx = images.findIndex((x) => x.id === coverId);
        return rebuiltUrls[Math.max(0, idx)];
      })();

      const coverPath =
        !willSaveToTees && rebuiltPaths.length
          ? (() => {
              const idx = images.findIndex((x) => x.id === coverId);
              return rebuiltPaths[Math.max(0, idx)] || rebuiltPaths[0] || "";
            })()
          : "";

      // Cleanup: if edit + portfolio mode, delete removed existing storage objects
      if (isEdit && !willSaveToTees && existingDoc) {
        const prevPaths: string[] = Array.isArray(existingDoc?.imagePaths)
          ? existingDoc.imagePaths
          : [];
        const nextPathsSet = new Set(rebuiltPaths.filter(Boolean));
        for (const p of prevPaths) {
          if (p && !nextPathsSet.has(p)) await deleteStoragePath(p);
        }
        if (existingDoc?.coverImagePath && coverPath && existingDoc.coverImagePath !== coverPath) {
          // cover image might still be used in list; above handles list cleanup, so no special case needed
        }
      }

      // Final doc update with images
      if (willSaveToTees) {
        await updateDoc(doc(db, colName, itemId), {
          images: rebuiltUrls,
        });
      } else {
        await updateDoc(doc(db, colName, itemId), {
          imageUrls: rebuiltUrls,
          imagePaths: rebuiltPaths,
          coverImageUrl: coverUrl,
          coverImagePath: coverPath,
          updatedAt: serverTimestamp(),
        });
      }

      setStatus(isEdit ? "✅ Updated!" : "✅ Created!");

      // If create mode, clear form
      if (!isEdit) {
        setTitle("");
        setClientName("");
        setLocation("");
        setDescription("");
        setTagsText("");
        setImages([]);
        setCoverId("");
      }
    } catch (e: any) {
      console.error("UPLOAD/UPDATE ERROR:", e);
      setStatus(e?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="p-6 text-white">Loading…</div>;

  if (!uid) {
    return (
      <AdminShell
        title="Admin"
        right={
          <Link className="underline text-white/70 hover:text-white" href="/admin">
            Go to Admin Login
          </Link>
        }
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-white/80">You are not signed in.</div>
        </div>
      </AdminShell>
    );
  }

  if (!adminOk) {
    return (
      <AdminShell
        title="Admin"
        right={
          <Link className="underline text-white/70 hover:text-white" href="/admin">
            Back
          </Link>
        }
      >
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
          <div className="text-red-200 font-semibold">This account is not an admin.</div>
          <div className="text-sm text-red-100/80 mt-2">
            Fix in Firestore: create <code className="text-red-100">users/{uid}</code> with{" "}
            <code className="text-red-100">role: "admin"</code>.
          </div>
        </div>
      </AdminShell>
    );
  }

  const pageTitle =
    titleOverride ??
    (editId ? "Edit Upload" : "Portfolio Upload");

  return (
    <AdminShell
      title={pageTitle}
      right={
        <>
          {backHref ? (
            <Link className="underline text-white/70 hover:text-white" href={backHref}>
              Back
            </Link>
          ) : null}
          <Link className="underline text-white/70 hover:text-white" href="/admin">
            Admin Home
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basics */}
        <Section title="Basics" subtitle="Core info that shows on cards and detail views.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>

            <Field label="Tags (comma-separated)" hint="Example: logo, branding, downtown">
              <Input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="logo, branding, downtown"
              />
            </Field>
          </div>

          {!isTshirtsCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Client name" hint="City of Aurora, Culver’s, etc.">
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Culver’s, City of Aurora, etc"
                />
              </Field>

              <Field label="Location" hint="Aurora IL, Batavia IL, Downtown, etc.">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Aurora, IL / Downtown / etc"
                />
              </Field>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminSelect
              label="Type"
              value={type}
              onChange={(v) => setType(v as ItemType)}
              disabled={lockType}
              options={[
                { label: "Mural", value: "mural" },
                { label: "Carpentry", value: "carpentry" },
                { label: "Graphic Design", value: "graphic-design" },
                { label: "Signage", value: "signage" },
              ]}
            />

            <AdminSelect
              label="Category"
              value={category}
              onChange={(v) => setCategory(v as Category)}
              disabled={lockCategory}
              options={
                type === "graphic-design"
                  ? [
                      { label: "/graphic-design/logos", value: "logos" },
                      { label: "/graphic-design/tshirts", value: "tshirts" },
                      { label: "/graphic-design/album-covers", value: "album-covers" },
                      { label: "/graphic-design/show-posters", value: "show-posters" },
                      { label: "/graphic-design/events", value: "events" },
                    ]
                  : [
                      { label: "Outdoor", value: "outdoor" },
                      { label: "Indoor", value: "indoor" },
                    ]
              }
            />
          </div>

          <Field label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[140px]"
            />
          </Field>
        </Section>

        {/* T-Shirts Store Settings */}
        {isTshirtsCategory ? (
          <Section title="T-Shirt Store Settings" subtitle="Optional: save this as a sellable product (teeProducts).">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-white/80 text-sm">
                Save as store product (recommended for /graphic-design/tshirts)
              </div>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={saveAsStoreProduct}
                  onChange={(e) => setSaveAsStoreProduct(e.target.checked)}
                />
                Enabled
              </label>
            </div>

            {saveAsStoreProduct ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Active">
                    <label className="inline-flex items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={teeActive}
                        onChange={(e) => setTeeActive(e.target.checked)}
                      />
                      Product is visible for sale
                    </label>
                  </Field>

                  <Field label="Price (USD)" hint="Example: 25">
                    <Input
                      value={teePrice}
                      onChange={(e) => setTeePrice(e.target.value)}
                      inputMode="decimal"
                    />
                  </Field>
                </div>

                <Field label="Fits">
                  <div className="flex gap-3 flex-wrap">
                    {(["men", "women"] as Fit[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFit(f)}
                        className={`rounded-full px-4 py-2 text-sm border transition ${
                          teeFits.includes(f)
                            ? "bg-white text-black border-white"
                            : "bg-white/5 text-white border-white/15 hover:bg-white/10"
                        }`}
                      >
                        {f === "men" ? "Men" : "Women"}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Sizes" hint="Click to remove. Add custom sizes below.">
                  <div className="flex flex-wrap gap-2">
                    {teeSizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => removeSize(s)}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                      >
                        {s} ✕
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      placeholder="Add size (e.g. 3XL)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const v = (e.currentTarget as HTMLInputElement).value;
                          addSize(v);
                          (e.currentTarget as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const el = document.activeElement as HTMLInputElement | null;
                        if (!el) return;
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </Field>

                <Field label="Colors" hint="Name + hex. (Example: Black #111827)">
                  <div className="space-y-3">
                    {teeColors.map((c, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          value={c.name}
                          onChange={(e) => updateColor(idx, { name: e.target.value })}
                          placeholder="Color name"
                        />
                        <Input
                          value={c.hex}
                          onChange={(e) => updateColor(idx, { hex: e.target.value })}
                          placeholder="#ffffff"
                        />
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-lg border border-white/15"
                            style={{ backgroundColor: c.hex }}
                            title={c.hex}
                          />
                          <Button type="button" variant="danger" onClick={() => removeColor(idx)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <Button type="button" variant="ghost" onClick={addColor}>
                      + Add color
                    </Button>
                  </div>
                </Field>
              </>
            ) : null}
          </Section>
        ) : null}

        {/* Images */}
        <Section title="Images" subtitle="Drag to reorder. Choose a cover. Remove anything you don’t want.">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-white/60">
              Recommended: upload 2–8 images. First impression matters.
            </div>

            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center rounded-lg bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90">
                Add Images
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </label>
          </div>

          {images.length ? (
            <div className="mt-4 grid grid-cols-1 gap-3">
              {images.map((img) => {
                const isCover = img.id === coverId;

                return (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => (dragIdRef.current = img.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      const dragId = dragIdRef.current;
                      if (dragId) moveImage(dragId, img.id);
                      dragIdRef.current = null;
                    }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-white/90">
                        {img.kind === "existing" ? "Existing image" : img.name || "New image"}
                      </div>
                      <div className="text-xs text-white/50">
                        {img.kind === "existing"
                          ? "Drag to reorder"
                          : img.size
                          ? `${Math.round(img.size / 1024)} KB • drag to reorder`
                          : "Drag to reorder"}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                      <input
                        type="radio"
                        name="cover"
                        checked={isCover}
                        onChange={() => setCoverId(img.id)}
                      />
                      Cover
                    </label>

                    <Button type="button" variant="ghost" onClick={() => removeImage(img.id)}>
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              No images yet.
            </div>
          )}
        </Section>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : editId ? "Save Changes" : "Create"}
            </Button>

            {editId ? (
              <Button type="button" variant="danger" disabled={busy} onClick={handleDelete}>
                Delete
              </Button>
            ) : null}
          </div>

          {status ? (
            <div className="text-sm text-white/80">{status}</div>
          ) : (
            <div className="text-sm text-white/40">
              Tip: Add <code className="text-white/60">?id=DOC_ID</code> to edit.
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="pt-2 text-sm text-white/50 flex gap-4">
          {backHref ? (
            <Link className="underline hover:text-white" href={backHref}>
              Back to Hub
            </Link>
          ) : null}
          <Link className="underline hover:text-white" href="/admin/portfolio/browse">
            Browse Items
          </Link>
        </div>
      </form>
    </AdminShell>
  );
}