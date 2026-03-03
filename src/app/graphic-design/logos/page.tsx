"use client";

import SoftPageShell from "@/components/SoftPageShell";
import PortfolioBrowser from "@/components/PortfolioBrowser";

export default function LogosPage() {
  return (
    <SoftPageShell variant="oceanNoir">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
        <PortfolioBrowser
          title="Logos"
          subtitle="Graphic design • Logos"
          initialFilters={{ active: true, type: "graphic-design", category: "logos" }}
          lockType
          lockCategory
        />
      </main>
    </SoftPageShell>
  );
}