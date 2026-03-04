"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "@/lib/firebase"; // if you don't export app, see note below

type UploadResult = {
  path: string;
  url: string;
  name: string;
  size: number;
  contentType?: string;
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

  const [uploads, setUploads] = useState<
    { name: string; pct: number; status: "uploading" | "done" | "error"; url?: string }[]
  >([]);

  const storage = useMemo(() => getStorage(app), []);

  const pickFiles = () => inputRef.current?.click();

  const validate = (files: File[]) => {
    const filtered = files.filter((f) => {
      if (accept === "image/*") return f.type.startsWith("image/");
      return true;
    });

    if (filtered.length === 0) return { ok: false, msg: "No valid files selected." };

    if (filtered.length > maxFiles) {
      return { ok: false, msg: `Too many files. Max ${maxFiles}.` };
    }

    const tooBig = filtered.find((f) => bytesToMB(f.size) > maxMB);
    if (tooBig) {
      return { ok: false, msg: `${tooBig.name} is too large (${bytesToMB(tooBig.size)}MB). Max ${maxMB}MB.` };
    }

    return { ok: true as const, files: filtered };
  };

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setErr(null);

      const check = validate(files);
      if (!check.ok) {
        setErr(check.msg);
        return;
      }

      const list = check.files;

      // initialize UI rows
      setUploads((prev) => [
        ...prev,
        ...list.map((f) => ({ name: f.name, pct: 0, status: "uploading" as const })),
      ]);

      const results: UploadResult[] = [];

      for (const file of list) {
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
                prev.map((u) => (u.name === file.name && u.status === "uploading" ? { ...u, pct } : u))
              );
            },
            (e) => reject(e),
            async () => resolve(await getDownloadURL(task.snapshot.ref))
          );
        }).catch((e: any) => {
          setUploads((prev) =>
            prev.map((u) => (u.name === file.name ? { ...u, status: "error", pct: 0 } : u))
          );
          throw e;
        });

        setUploads((prev) =>
          prev.map((u) => (u.name === file.name ? { ...u, status: "done", pct: 100, url } : u))
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

    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;

    try {
      await uploadFiles(files);
    } catch (e: any) {
      setErr(e?.message || "Upload failed.");
      console.error(e);
    }
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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
          {uploads.map((u, i) => (
            <div key={`${u.name}-${i}`} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="truncate text-sm">{u.name}</div>
                <div className="text-xs text-white/60">
                  {u.status === "uploading" ? `${u.pct}%` : u.status === "done" ? "Done" : "Error"}
                </div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-white/60 transition-all"
                  style={{ width: `${u.pct}%` }}
                />
              </div>
              {u.url ? (
                <div className="mt-2 break-all text-xs text-white/60">{u.url}</div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}