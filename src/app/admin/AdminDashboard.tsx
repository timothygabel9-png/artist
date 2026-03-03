"use client";

import { useMemo, useState } from "react";
import PortfolioAdmin from "./tabs/PortfolioAdmin";
import TeesAdmin from "./tabs/TeesAdmin";
import MediaAdmin from "./tabs/MediaAdmin";
import StudioAdmin from "./tabs/StudioAdmin";

type TabKey = "portfolio" | "graphic design" | "media" | "studio";

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabKey>("portfolio");

  const tabs = useMemo(
    () => [
      { key: "portfolio" as const, label: "Portfolio" },
      { key: "tees" as const, label: "Tees" },
      { key: "media" as const, label: "Media" },
      { key: "studio" as const, label: "Studio" },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-2 text-sm text-white/60">
            Manage Portfolio (soft delete), Tees/Media/Studio (hard delete).
          </p>
        </header>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "rounded-full border px-4 py-2 text-sm transition",
                tab === t.key
                  ? "border-white/25 bg-white/10 text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
          {tab === "portfolio" && <PortfolioAdmin />}
          {tab === "tees" && <TeesAdmin />}
          {tab === "media" && <MediaAdmin />}
          {tab === "studio" && <StudioAdmin />}
        </section>
      </div>
    </main>
  );
}