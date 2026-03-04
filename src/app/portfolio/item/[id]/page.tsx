// src/app/portfolio/item/[id]/page.tsx
import SoftPageShell from "@/components/SoftPageShell";
import Link from "next/link";
import PortfolioItemClient from "./PortfolioItemClient";

export default async function PortfolioItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SoftPageShell title="Portfolio Item" variant="oceanNoir">
      <main className="mx-auto w-full max-w-5xl px-4 py-10 text-white">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/portfolio"
            className="text-sm underline text-white/70 hover:text-white"
          >
            ← Back to Portfolio
          </Link>
        </div>

        <PortfolioItemClient id={id} />
      </main>
    </SoftPageShell>
  );
}