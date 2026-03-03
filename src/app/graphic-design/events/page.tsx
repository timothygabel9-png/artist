"use client";

import SoftPageShell from "@/components/SoftPageShell";
import PortfolioBrowser from "@/components/PortfolioBrowser";

export default function EventsPage() {
  return (
    <SoftPageShell variant="oceanNoir">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
        <PortfolioBrowser
          title="Album Covers"
          subtitle="Graphic Design • Events"
          initialFilters={{
            active: true,
            type: "graphic-design",
            category: "events",
          }}
          lockType
          lockCategory
        />
      </main>
    </SoftPageShell>
  );
}