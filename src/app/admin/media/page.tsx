"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { isAdmin } from "@/lib/admin";
import { uploadFile } from "@/lib/upload";

type Mode = "audio" | "youtube";

export default function AdminMediaPage() {
  const [ready, setReady] = useState(false);
  const [adminOk, setAdminOk] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("audio");

  const [title, setTitle] = useState("");
  const [youtubeUrlOrId, setYoutubeUrlOrId] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

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

  const youtubeId = useMemo(() => {
    const raw = youtubeUrlOrId.trim();
    if (!raw) return "";
    const m1 = raw.match(/[?&]v=([^&]+)/);
    if (m1?.[1]) return m1[1];
    const m2 = raw.match(/youtu\.be\/([^?&]+)/);
    if (m2?.[1]) return m2[1];
    return raw; // assume already ID
  }, [youtubeUrlOrId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    if (!adminOk || !uid) {
      setStatus("Not authorized.");
      return;
    }

    // Better UX validation (mode-specific)
    if (mode === "audio") {
      if (!audioFile) {
        setStatus("Please choose an audio file first.");
        return;
      }
      if (!title.trim()) {
        setStatus("Title is required.");
        return;
      }
    } else {
      if (!title.trim()) {
        setStatus("Title is required.");
        return;
      }
      if (!youtubeId) {
        setStatus("Please paste a YouTube URL or ID.");
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "youtube") {
        await addDoc(collection(db, "mediaItems"), {
          type: "youtube",
          title: title.trim(),
          youtubeId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setStatus("✅ YouTube media item created!");
        setTitle("");
        setYoutubeUrlOrId("");
        return;
      }

      // mode === "audio"
      const ref = await addDoc(collection(db, "mediaItems"), {
        type: "audio",
        title: title.trim(),
        audioUrl: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const itemId = ref.id;

      const safeName = audioFile!.name.replace(/[^\w.\-]+/g, "_");
      const path = `media/${itemId}/${Date.now()}_${safeName}`;

      setStatus("Uploading audio…");
      const url = await uploadFile(audioFile!, path);

      await updateDoc(doc(db, "mediaItems", itemId), {
        audioUrl: url,
        updatedAt: serverTimestamp(),
      });

      setStatus("✅ Audio media item created!");
      setTitle("");
      setAudioFile(null);
    } catch (err: any) {
      console.error("ADMIN MEDIA ERROR:", err);
      setStatus(err?.code ? `${err.code}: ${err.message || "Failed."}` : err?.message || "Failed.");
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
          Fix: Firestore doc <code>users/{uid}</code> with <code>role: "admin"</code>.
        </p>
        <Link className="underline" href="/admin">
          Back
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin • Media</h1>
        <div className="flex items-center gap-4">
          <Link className="underline" href="/media">
            View Media
          </Link>
          <Link className="underline" href="/admin">
            Admin Home
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("audio")}
            className={`px-4 py-2 rounded border ${
              mode === "audio" ? "bg-black text-white" : "bg-white"
            }`}
          >
            Upload Audio
          </button>
          <button
            type="button"
            onClick={() => setMode("youtube")}
            className={`px-4 py-2 rounded border ${
              mode === "youtube" ? "bg-black text-white" : "bg-white"
            }`}
          >
            Add YouTube
          </button>
        </div>

        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={mode === "audio" ? "Demo Track" : "Studio Session"}
          />
        </div>

        {mode === "youtube" ? (
          <div>
            <label className="block text-sm mb-1">YouTube URL or ID</label>
            <input
              className="w-full border rounded p-2"
              value={youtubeUrlOrId}
              onChange={(e) => setYoutubeUrlOrId(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=Th6MgtypAew or Th6MgtypAew"
            />
            {youtubeId ? (
              <p className="text-xs text-gray-600 mt-2">Detected ID: {youtubeId}</p>
            ) : null}
          </div>
        ) : (
          <div>
            <label className="block text-sm mb-2">Audio file (mp3/wav)</label>

            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-block cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
                Browse Audio
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
              </label>

              {audioFile ? (
                <button
                  type="button"
                  className="rounded-md border px-3 py-2 text-sm hover:bg-black/5"
                  onClick={() => setAudioFile(null)}
                >
                  Remove
                </button>
              ) : null}
            </div>

            {audioFile ? (
              <p className="text-xs text-gray-600 mt-2">
                Selected: {audioFile.name} ({Math.round(audioFile.size / 1024)} KB)
              </p>
            ) : (
              <p className="text-xs text-gray-600 mt-2">No file chosen.</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : mode === "audio" ? "Create Audio Item" : "Create YouTube Item"}
        </button>

        {status && <p className="text-sm mt-2">{status}</p>}
      </form>
    </main>
  );
}
