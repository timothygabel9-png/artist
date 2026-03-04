"use client";

import { useMemo, useState } from "react";
import PortfolioAdmin from "./tabs/PortfolioAdmin";
import TeesAdmin from "./tabs/TeesAdmin";
import MediaAdmin from "./tabs/MediaAdmin";
import StudioAdmin from "./tabs/StudioAdmin";

const TABS = [
  { key: "portfolio", label: "Portfolio" },
  { key: "tees", label: "Tees" },
  { key: "media", label: "Media" },
  { key: "studio", label: "Studio" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabKey>("portfolio");

  const tabs = useMemo(() => TABS, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="text-white/70">Manage portfolio, tees, media, and studio.</p>
        </header>

        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "rounded-full border px-4 py-2 text-sm transition",
                tab === t.key ? "border-white bg-white/10" : "border-white/15 hover:border-white/30",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "portfolio" && <PortfolioAdmin />}
        {tab === "tees" && <TeesAdmin />}
        {tab === "media" && <MediaAdmin />}
        {tab === "studio" && <StudioAdmin />}
      </div>
    </main>
  );
}