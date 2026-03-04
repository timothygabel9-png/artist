"use client";

import SoftPageShell from "@/components/SoftPageShell";
import PortfolioBrowser from "@/components/PortfolioBrowser";

export default function EventsPage() {
  return (
    <SoftPageShell
  title="Events"
  subtitle="Graphic design • Album Covers"
  variant="oceanNoir"
>
  <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
    <PortfolioBrowser
      title="album-covers"
      subtitle="Graphic design • Events"
      initialFilters={{ active: true, type: "graphic-design", category: "events" }}
      lockType
      lockCategory
    />
      </main>
    </SoftPageShell>
  );
}