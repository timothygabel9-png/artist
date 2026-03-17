"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";
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
  const router = useRouter();

  const tabs = useMemo(() => TABS, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin</h1>
            <p className="text-white/70">
              Manage portfolio, tees, media, and studio.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur hover:bg-white/20"
          >
            Logout
          </button>
        </header>

        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "rounded-full border px-4 py-2 text-sm transition",
                tab === t.key
                  ? "border-white bg-white/10"
                  : "border-white/15 hover:border-white/30",
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