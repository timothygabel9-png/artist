"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { storage as sharedStorage } from "@/lib/firebase"; // ✅ use your exported storage instance

type UploadResult = {
  path: string;
  url: string;
  name: string;
  size: number;
  contentType?: string;
};

type UploadRow = {
  id: string; // ✅ unique per file so duplicates don't collide
  name: string;
  pct: number;
  status: "uploading" | "done" | "error";
  url?: string;
};

type Props = {
  folder: string; // e.g. "portfolio/album-covers"
  multiple?: boolean;
  accept?: string; // e.g. "image/*"
  maxFiles?: number;
  maxMB?: number;
  onUploaded: (files: UploadResult[]) => void;
  className?: string;
};

function bytesToMB(n: number) {
  return Math.round((n / (1024 * 1024)) * 10) / 10;
}

function isAccepted(file: File, accept: string) {
  if (!accept || accept === "*/*") return true;

  // common case
  if (accept === "image/*") return file.type.startsWith("image/");

  // handle comma separated like "image/*,.png,.jpg"
  const parts = accept.split(",").map((s) => s.trim()).filter(Boolean);

  for (const p of parts) {
    if (p.endsWith("/*")) {
      const base = p.slice(0, -2);
      if (file.type.startsWith(base)) return true;
    } else if (p.startsWith(".")) {
      if (file.name.toLowerCase().endsWith(p.toLowerCase())) return true;
    } else {
      // exact mime like "image/png"
      if (file.type === p) return true;
    }
  }

  return false;
}

export default function DragDropUpload({
  folder,
  multiple = true,
  accept = "image/*",
  maxFiles = 20,
  maxMB = 20,
  onUploaded,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [uploads, setUploads] = useState<UploadRow[]>([]);

  // ✅ use the already-initialized storage instance from lib/firebase
  // but keep a fallback just in case
  const storage = useMemo(() => sharedStorage ?? getStorage(), []);

  const pickFiles = () => inputRef.current?.click();

  const validate = (files: File[]) => {
    const filtered = files.filter((f) => isAccepted(f, accept));

    if (filtered.length === 0) return { ok: false as const, msg: "No valid files selected." };

    const limited = multiple ? filtered.slice(0, maxFiles) : filtered.slice(0, 1);

    if (multiple && filtered.length > maxFiles) {
      return { ok: false as const, msg: `Too many files. Max ${maxFiles}.` };
    }

    const tooBig = limited.find((f) => bytesToMB(f.size) > maxMB);
    if (tooBig) {
      return {
        ok: false as const,
        msg: `${tooBig.name} is too large (${bytesToMB(tooBig.size)}MB). Max ${maxMB}MB.`,
      };
    }

    return { ok: true as const, files: limited };
  };

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setErr(null);

      const check = validate(files);
      if (!check.ok) {
        setErr(check.msg);
        return;
      }

      const list = check.files; // ✅ always File[]

      // init rows with stable ids
      const rows: UploadRow[] = list.map((f) => ({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}-${f.name}`,
        name: f.name,
        pct: 0,
        status: "uploading",
      }));

      setUploads((prev) => [...rows, ...prev]);

      const results: UploadResult[] = [];

      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const rowId = rows[i].id;

        const safeName = file.name.replace(/[^\w.\-() ]+/g, "_");
        const path = `${folder}/${Date.now()}_${safeName}`;
        const storageRef = ref(storage, path);

        const task = uploadBytesResumable(storageRef, file, {
          contentType: file.type || undefined,
        });

        const url = await new Promise<string>((resolve, reject) => {
          task.on(
            "state_changed",
            (snap) => {
              const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
              setUploads((prev) =>
                prev.map((u) => (u.id === rowId ? { ...u, pct } : u))
              );
            },
            (e) => reject(e),
            async () => resolve(await getDownloadURL(task.snapshot.ref))
          );
        }).catch((e: any) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === rowId ? { ...u, status: "error", pct: 0 } : u))
          );
          throw e;
        });

        setUploads((prev) =>
          prev.map((u) => (u.id === rowId ? { ...u, status: "done", pct: 100, url } : u))
        );

        results.push({
          path,
          url,
          name: file.name,
          size: file.size,
          contentType: file.type || undefined,
        });

        if (!multiple) break;
      }

      onUploaded(results);
    },
    [accept, folder, maxFiles, maxMB, multiple, onUploaded, storage]
  );

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);

    const files = Array.from(e.dataTransfer?.files ?? []);
    if (!files.length) return;

    try {
      await uploadFiles(files);
    } catch (e: any) {
      setErr(e?.message || "Upload failed.");
      console.error(e);
    }
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    try {
      await uploadFiles(files);
    } catch (e: any) {
      setErr(e?.message || "Upload failed.");
      console.error(e);
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onPick}
        className="hidden"
      />

      <div
        onClick={pickFiles}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOver(false);
        }}
        onDrop={onDrop}
        className={[
          "cursor-pointer rounded-2xl border p-6 transition",
          isOver ? "border-white/40 bg-white/10" : "border-white/15 bg-white/5 hover:border-white/25",
        ].join(" ")}
      >
        <div className="text-base font-semibold">Drag & drop images here</div>
        <div className="mt-1 text-sm text-white/70">
          or click to browse • {multiple ? `up to ${maxFiles} files` : "single file"} • max {maxMB}MB each
        </div>
      </div>

      {err ? <div className="mt-3 text-sm text-red-300">{err}</div> : null}

      {uploads.length ? (
        <div className="mt-4 space-y-2">
          {uploads.map((u) => (
            <div key={u.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="truncate text-sm">{u.name}</div>
                <div className="text-xs text-white/60">
                  {u.status === "uploading" ? `${u.pct}%` : u.status === "done" ? "Done" : "Error"}
                </div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-white/60 transition-all" style={{ width: `${u.pct}%` }} />
              </div>
              {u.url ? <div className="mt-2 break-all text-xs text-white/60">{u.url}</div> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}