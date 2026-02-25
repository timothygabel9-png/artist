"use client";

import { useEffect, useState } from "react";

type AboutCard = { title: string; body: string };
type AboutContent = {
  title: string;
  paragraphs: string[];
  cards: AboutCard[];
  ctaNote: string;
};

const DEFAULT: AboutContent = {
  title: "About Joshua Schultz",
  paragraphs: ["", "", "", ""],
  cards: [
    { title: "", body: "" },
    { title: "", body: "" },
    { title: "", body: "" },
    { title: "", body: "" },
  ],
  ctaNote: "",
};

export default function AdminAboutPage() {
  const [draft, setDraft] = useState<AboutContent>(DEFAULT);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      setStatus("Loading…");
      try {
        const res = await fetch("/api/admin/about/get");
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data?.error || "Failed to load");

        setDraft(data.draft ?? data.published ?? DEFAULT);
        setStatus("");
      } catch (e: any) {
        setStatus(e?.message || "Failed to load");
      }
    })();
  }, []);

  // Optional: load current published/draft from a simple read endpoint later.
  // For now: admin edits and saves.

  async function saveDraft() {
    setStatus("Saving draft…");
    try {
      const res = await fetch("/api/admin/about/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "Failed to save draft");
      setStatus("✅ Draft saved");
    } catch (e: any) {
      setStatus(e?.message || "Failed to save draft");
    }
  }

  async function publish() {
    setStatus("Publishing…");
    try {
      const res = await fetch("/api/admin/about/publish", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "Failed to publish");
      setStatus("✅ Published! Home page now uses the published version.");
    } catch (e: any) {
      setStatus(e?.message || "Failed to publish");
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Admin: About Section</h1>

      <div className="rounded-lg border p-5 space-y-4">
        <label className="block text-sm font-medium">Title</label>
        <input
          className="w-full rounded-md border p-2"
          value={draft.title}
          onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
        />

        <div className="space-y-3">
          <div className="text-sm font-medium">Paragraphs</div>
          {draft.paragraphs.map((p, idx) => (
            <textarea
              key={idx}
              className="w-full rounded-md border p-2 min-h-[80px]"
              value={p}
              onChange={(e) =>
                setDraft((prev) => {
                  const next = [...prev.paragraphs];
                  next[idx] = e.target.value;
                  return { ...prev, paragraphs: next };
                })
              }
              placeholder={`Paragraph ${idx + 1}`}
            />
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">Cards</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {draft.cards.map((c, idx) => (
              <div key={idx} className="rounded-md border p-3 space-y-2">
                <input
                  className="w-full rounded-md border p-2"
                  value={c.title}
                  onChange={(e) =>
                    setDraft((prev) => {
                      const cards = [...prev.cards];
                      cards[idx] = { ...cards[idx], title: e.target.value };
                      return { ...prev, cards };
                    })
                  }
                  placeholder="Card title"
                />
                <textarea
                  className="w-full rounded-md border p-2 min-h-[90px]"
                  value={c.body}
                  onChange={(e) =>
                    setDraft((prev) => {
                      const cards = [...prev.cards];
                      cards[idx] = { ...cards[idx], body: e.target.value };
                      return { ...prev, cards };
                    })
                  }
                  placeholder="Card body"
                />
              </div>
            ))}
          </div>
        </div>

        <label className="block text-sm font-medium">CTA Note</label>
        <textarea
          className="w-full rounded-md border p-2 min-h-[80px]"
          value={draft.ctaNote}
          onChange={(e) => setDraft((p) => ({ ...p, ctaNote: e.target.value }))}
        />

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={saveDraft}
            className="rounded-md bg-black px-4 py-2 text-white font-semibold"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={publish}
            className="rounded-md border px-4 py-2 font-semibold"
          >
            Publish
          </button>
          {status && <p className="text-sm text-gray-700 self-center">{status}</p>}
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Publishing updates the content the home page renders (it reads the{" "}
        <code>published</code> version).
      </p>
    </main>
  );
}