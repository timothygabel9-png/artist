"use client";

import SoftPageShell from "@/components/SoftPageShell";
import PortfolioBrowser from "@/components/PortfolioBrowser";

export default function LogosPage() {
  return (
    <SoftPageShell
  title="Logos"
  subtitle="Graphic design • Logos"
  variant="oceanNoir"
>
  <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
    <PortfolioBrowser
      title="logos"
      subtitle="Graphic design • Logos"
      initialFilters={{ active: true, type: "graphic-design", category: "logos" }}
      lockType
      lockCategory
    />
      </main>
    </SoftPageShell>
  );
}