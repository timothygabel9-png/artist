"use client";

import SoftPageShell from "@/components/SoftPageShell";
import PortfolioBrowser from "@/components/PortfolioBrowser";

export default function ShowPostersPage() {
  return (
    <SoftPageShell variant="oceanNoir">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
        <PortfolioBrowser
          title="Album Covers"
          subtitle="Graphic Design • Show Posters"
          initialFilters={{
            active: true,
            type: "graphic-design",
            category: "show-posters",
          }}
          lockType
          lockCategory
        />
      </main>
    </SoftPageShell>
  );
}