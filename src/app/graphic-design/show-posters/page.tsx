"use client";

import SoftPageShell from "@/components/SoftPageShell";
import PortfolioBrowser from "@/components/PortfolioBrowser";

export default function ShowPostersPage() {
  return (
<SoftPageShell
  title="Show Posters"
  subtitle="Graphic design • Show Posters"
  variant="oceanNoir"
>
  <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
    <PortfolioBrowser
      title="show-posters"
      subtitle="Graphic design • Album Covers"
      initialFilters={{ active: true, type: "graphic-design", category: "show-posters" }}
      lockType
      lockCategory
    />
      </main>
    </SoftPageShell>
  );
}