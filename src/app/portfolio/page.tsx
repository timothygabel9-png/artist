import SoftPageShell from "@/components/SoftPageShell";
import PortfolioBrowser from "@/components/PortfolioBrowser";

export default function PortfolioPage() {
  return (
    <SoftPageShell
      title="Portfolio"
      subtitle="Murals, graphic design, signage, and creative work"
      variant="oceanNoir"
    >
      <main className="mx-auto w-full max-w-6xl px-4 py-8 text-white sm:px-6 sm:py-10 lg:px-8">
        <PortfolioBrowser
          title="Portfolio"
          subtitle="Murals, carpentry, graphic design, signage, and featured work."
          initialFilters={{ active: true }}
        />
      </main>
    </SoftPageShell>
  );
}