import SoftPageShell from "@/components/SoftPageShell";
import PortfolioBrowser from "@/components/PortfolioBrowser";

const allowed = ["logos", "tshirts", "album-covers", "show-posters", "events"] as const;
type Cat = (typeof allowed)[number];

function isCat(v: string): v is Cat {
  return (allowed as readonly string[]).includes(v);
}

function niceTitle(cat: Cat) {
  switch (cat) {
    case "album-covers":
      return "Album Covers";
    case "show-posters":
      return "Show Posters";
    case "tshirts":
      return "T-Shirts";
    case "logos":
      return "Logos";
    case "events":
      return "Events";
  }
}

export default function GraphicDesignCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const cat = params.category;

  if (!isCat(cat)) {
    return (
      <SoftPageShell title="Not Found" variant="oceanNoir">
        <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
          <h1 className="text-2xl font-bold">Category not found</h1>
        </main>
      </SoftPageShell>
    );
  }

  return (
    <SoftPageShell title={`Graphic Design • ${niceTitle(cat)}`} variant="oceanNoir">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
        <PortfolioBrowser
          title={niceTitle(cat)}
          subtitle="Graphic design"
          initialFilters={{ active: true, type: "graphic-design", category: cat }}
          lockType
          lockCategory
        />
      </main>
    </SoftPageShell>
  );
}