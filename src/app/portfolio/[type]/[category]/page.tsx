import SoftPageShell from "@/components/SoftPageShell";
import PortfolioBrowser from "@/components/PortfolioBrowser";

export default function PortfolioCategoryPage({
  params,
}: {
  params: { type: string; category: string };
}) {
  const { type, category } = params;

  const nice =
    category === "album-covers"
      ? "Album Covers"
      : category === "show-posters"
      ? "Show Posters"
      : category === "tshirts"
      ? "T-Shirts"
      : category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <SoftPageShell title={nice} variant="oceanNoir">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
        <PortfolioBrowser
          title={nice}
          initialFilters={{ active: true, type: type as any, category: category as any }}
          lockType
          lockCategory
        />
      </main>
    </SoftPageShell>
  );
}