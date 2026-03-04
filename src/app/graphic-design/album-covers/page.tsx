"use client";

import SoftPageShell from "@/components/SoftPageShell";
import PortfolioBrowser from "@/components/PortfolioBrowser";

export default function AlbumCoversPage() {
  return (
    <SoftPageShell
  title="Album Covers"
  subtitle="Graphic design • Album Covers"
  variant="oceanNoir"
>
  <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
    <PortfolioBrowser
      title="album-covers"
      subtitle="Graphic design • Album Covers"
      initialFilters={{ active: true, type: "graphic-design", category: "album-covers" }}
      lockType
      lockCategory
    />
      </main>
    </SoftPageShell>
  );
}