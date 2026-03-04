import SoftPageShell from "@/components/SoftPageShell";
import PortfolioBrowser from "@/components/PortfolioBrowser";

const allowed = ["mural", "carpentry", "graphic-design", "signage"] as const;
type T = (typeof allowed)[number];

function isType(v: string): v is T {
  return (allowed as readonly string[]).includes(v);
}

function niceTitle(type: T) {
  switch (type) {
    case "mural":
      return "Murals";
    case "carpentry":
      return "Carpentry";
    case "graphic-design":
      return "Graphic Design";
    case "signage":
      return "Signage";
  }
}

export default function PortfolioTypePage({ params }: { params: { type: string } }) {
  const type = params.type;

  if (!isType(type)) {
    return (
      <SoftPageShell title="Not Found" variant="oceanNoir">
        <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
          <h1 className="text-2xl font-bold">Type not found</h1>
        </main>
      </SoftPageShell>
    );
  }

  return (
    <SoftPageShell title={niceTitle(type)} variant="oceanNoir">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
        <PortfolioBrowser
          title={niceTitle(type)}
          initialFilters={{ active: true, type }}
          lockType
        />
      </main>
    </SoftPageShell>
  );
}